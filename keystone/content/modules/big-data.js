/* Module: big-data — Big Data & Analytics.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs big-data */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-oltp-olap', {
  eli5: 'Running a shop (taking orders, one at a time, instantly) and understanding a shop (adding up a year of sales) are two different jobs. They need two different kinds of database, set up in two different ways.',

  cards: [
    { kind: 'concept', title: 'The question that slowed down checkout',
      body: `It is Monday morning. The boss asks an analyst: *"What were our sales by country, by month, for the last three years?"*

        The analyst types one query against the live shop database and presses Enter. The query has to read **every order ever placed**: hundreds of millions of rows. For the next ten minutes the database is flat out, and customers trying to check out see spinning wheels and timeouts.

        Nothing was broken. The analyst simply asked the database to do a **different kind of job** from the one it was built for.

        This lesson explains the two jobs, why they pull in opposite directions, and how companies keep them apart.` },

    { kind: 'compare', title: 'Two jobs, two names',
      body: '**OLTP** is *online transaction processing*: running the business. **OLAP** is *online analytical processing*: understanding it.',
      cols: ['OLTP (run it)', 'OLAP (understand it)'],
      rows: [
        ['Typical task', 'Place an order, update a stock count', 'Total sales per region per month'],
        ['Touches', 'A few rows, by key', 'Millions of rows, a few columns'],
        ['Speed matters as', 'Milliseconds per request', 'Seconds or minutes per big query'],
        ['Users', 'Thousands of customers at once', 'A few analysts and dashboards'],
        ['Data is', 'Current, always being changed', 'History, mostly loaded then read'],
        ['Examples', 'PostgreSQL, MySQL for the app', 'Warehouses such as BigQuery, Snowflake']
      ] },

    { kind: 'metaphor', title: 'The till and the accountant',
      body: `A busy shop has a **till**. It handles one customer at a time, in seconds: scan, take payment, hand over the receipt. It must never be slow, and it only ever deals with *this* customer's items.

        At the end of the year the **accountant** sits down with a year's worth of receipts and asks: "which products made the most money in the winter months?" She never looks at one receipt in isolation. She scans thousands, but only cares about two things on each: the product and the price.

        Nobody would give the accountant the till to work on during opening hours. Or make her read the till roll while customers queue.

        Where the metaphor stops: real systems can copy data from the till to the accountant automatically, every night.` },

    { kind: 'concept', title: 'Row stores: all of one record, together',
      body: `Most databases you have met (PostgreSQL, MySQL) are **row stores**. They keep each record's fields **together** on disk: id, customer, country, total, date, all in a row, then the next row.

        That layout is perfect for OLTP. "Fetch order 42" reads one chunk of disk and returns the whole record. "Place an order" writes one chunk.

        But consider the analyst's query: **sum the \`total\` column**. The database must still pull in *whole rows*, with every column, just to look at one field of each. If the table has 20 columns, about 95% of what it reads is thrown away.` },

    { kind: 'code', title: 'The same table, laid out two ways',
      body: 'Three orders. Tap the lines to see how a row store and a column store arrange them on disk.',
      code: { lang: 'text', src: `
        id | country | total
        1  | UK      | 30
        2  | FR      | 45
        3  | UK      | 20

        ROW STORE    [1,UK,30] [2,FR,45] [3,UK,20]
        COLUMN STORE [1,2,3]   [UK,FR,UK] [30,45,20]`,
        notes: {
          1: 'The logical table the way you picture it: rows and columns.',
          6: '**Row store:** every field of one order sits together. Great for "show me order 2" and for writing a new order.',
          7: '**Column store:** each column is stored on its own. To sum the totals you read just `[30,45,20]` and never touch the other columns.'
        } },
      note: 'The ClickHouse card in *NoSQL & Search* was a columnar store. Now you know why it is fast at reports.' },

    { kind: 'concept', title: 'Why column stores win at analytics',
      body: `A **column store** keeps each column in its own place. For analytics, that brings three advantages:

        - **Read only what you need.** "Sum the totals" touches one column of 20. That is roughly 20 times less data to read.
        - **Better compression.** A column holds similar values (a thousand "UK" in a row), which squash down very small. Smaller data means faster reads.
        - **Fast scans of huge ranges.** The whole design is built for reading millions of values in a row.

        The price: writing a single new row means touching every column's file, which is slower. That is fine when data arrives in big batches. It would be a poor fit for a busy shop till.` },

    { kind: 'pitfall', title: 'Do not run reports on the production database',
      body: `It is tempting: the data is right there, so why not query it directly? Because the same machine is serving customers, and a heavy report:

        - **Hogs CPU, memory and disk**, so customer requests queue behind it.
        - **Pushes useful data out of the cache** (the memory the database uses to answer common requests fast).
        - **Can hold locks** that block writes, depending on the query.

        Even pointing the report at a **read replica** (from the Scaling Data module) protects the main machine, but it is still a row store, still slow for big scans, and still holds only *this* system's data, not sales plus marketing plus support.

        The standard fix is to **copy the data elsewhere** and analyse it there.` },

    { kind: 'diagram', title: 'The analytics pipeline in one picture',
      body: 'This is the shape of almost every analytics setup. Over the next lessons we zoom into each box.',
      nodes: [
        { id: 'app', label: 'Shop database (OLTP)', icon: '🛒', x: 0, y: 0, tone: 'accent' },
        { id: 'logs', label: 'Logs, files, other apps', icon: '📄', x: 2, y: 0, tone: 'muted' },
        { id: 'pipe', label: 'Pipeline (move + clean)', icon: '🔧', x: 1, y: 1, tone: 'info' },
        { id: 'wh', label: 'Warehouse / lake (OLAP)', icon: '🏛️', x: 1, y: 2, tone: 'good' },
        { id: 'bi', label: 'Dashboards and reports', icon: '📊', x: 1, y: 3 }
      ],
      edges: [
        { from: 'app', to: 'pipe', label: 'extract' },
        { from: 'logs', to: 'pipe', label: 'extract' },
        { from: 'pipe', to: 'wh', label: 'load' },
        { from: 'wh', to: 'bi', label: 'queries' }
      ],
      caption: 'Customers hit the left-hand database. Analysts only ever touch the warehouse. The two never compete.' },

    { kind: 'tip', title: 'A rule of thumb for telling them apart',
      body: `Ask two questions about a query:

        1. **How many rows does it touch?** A few (by id) is OLTP. Millions is OLAP.
        2. **How many columns does it need?** All of one record is OLTP. One or two of many is OLAP.

        "Show me order 42" is OLTP. "Average basket size per country per month" is OLAP.

        Some systems try to do both at once, under the label **HTAP** (hybrid transactional and analytical processing). They exist, but most companies still keep the two worlds separate, because separate is simple and proven.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'Is each task OLTP or OLAP?', buckets: ['OLTP', 'OLAP'],
      items: [['Add an item to a customer’s basket', 0], ['Find the best-selling product of the decade', 1], ['Mark an order as shipped', 0], ['Average basket size per country per month', 1], ['Look up a customer by email at login', 0], ['Compare this year’s revenue with last year’s', 1]],
      explain: 'OLTP handles individual, current records, fast. OLAP scans history in bulk to answer questions about patterns.' },

    { type: 'mcq', after: 4, q: 'Why is a column store so quick at "sum all the order totals" over 500 million rows?',
      options: ['It reads only the totals column and skips every other field', 'It keeps the whole table in one single row', 'It never compresses anything, so nothing needs unpacking', 'It sorts the table by customer before each query'],
      answer: 0,
      why: [null, 'That is nonsense: a column store stores each column separately.', 'It usually compresses harder, because columns hold similar values.', 'Sorting a table before every query would be slower, not faster.'],
      explain: 'Columnar layout lets the database read just the data the query needs. A row store would have to read whole rows to find one field in each.' },

    { type: 'tf', after: 5, statement: 'Pointing a heavy report at a read replica protects the main database, but the report still runs on a row store.', answer: true,
      explain: 'A replica takes the load off the primary, which is a real benefit. But it holds only this system’s data in a row layout, so big scans are still slow compared with a warehouse.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['OLTP', 'Fast, small, current-data transactions'], ['OLAP', 'Big queries over history'], ['Row store', 'All fields of a record together'], ['Column store', 'All values of a field together'], ['HTAP', 'One system that tries to do both jobs']],
      explain: 'OLTP/OLAP name the two workloads. Row/column stores are the storage layouts that suit them best.' },

    { type: 'estimate', q: 'A table has 50 columns of roughly equal width. A query sums just one of them. Roughly how many times less data does a column store need to read than a row store?',
      answer: 50, unit: 'times less data', tolerance: 2,
      explain: 'A row store reads whole rows, so all 50 columns come along. A column store reads one of the 50, so about 50 times less. Compression often widens the gap further.' },

    { type: 'order', prompt: 'Put the analytics pipeline in order, from where data is born to where it is used.',
      items: ['Customers use the shop database (OLTP)', 'Data is extracted from the shop database', 'It is cleaned and moved by a pipeline', 'It lands in a warehouse or lake', 'Analysts query it with dashboards and reports'],
      explain: 'Data flows from the system that makes it, through a pipeline, into a store built for analysis, and only then to the people who ask questions.' },

    { type: 'spot', prompt: 'Which of these queries do you least want running on the live production shop database during the day?',
      code: { lang: 'sql', src: `
        SELECT * FROM orders WHERE id = 42;
        UPDATE stock SET qty = qty - 1 WHERE product_id = 7;
        SELECT country, SUM(total) FROM orders GROUP BY country;
        INSERT INTO baskets (customer_id, product_id) VALUES (9, 7);` },
      lines: [3],
      explain: 'Line 3 scans every order ever placed and aggregates it. It is a classic OLAP query: heavy, long, and ideal for the warehouse. The other lines touch a handful of rows by key.' },

    { type: 'scenario', title: 'The Monday-morning meltdown', intro: 'You are the lone backend developer at a growing online shop. Every Monday the analyst runs her weekly reports on the live database, and checkout slows down. The boss wants it fixed this week, cheaply.',
      meters: { 'customer experience': 40, 'analyst happiness': 50, 'effort': 80 },
      steps: [
        { text: 'The quickest idea on the table?',
          choices: [
            { label: 'Point the analyst at a read replica', score: 2, effects: { 'customer experience': 30, 'effort': -5 }, feedback: 'Customers are protected straight away, which is a real win. But reports are still slow on a row store, and she cannot join sales with marketing data. The best quick fix on offer, though not the end state.' },
            { label: 'Ask the analyst to run reports at night only', score: 1, effects: { 'customer experience': 20, 'analyst happiness': -20 }, feedback: 'It helps, but it is a rota rather than a fix, and every ad-hoc question must wait until tomorrow.' },
            { label: 'Do nothing; reports are important', score: 0, effects: { 'customer experience': -20 }, feedback: 'Reports are important, and so are the customers paying the bills.' }
          ] },
        { text: 'The company is growing and wants dashboards across sales, marketing and support. What is the sensible next step?',
          choices: [
            { label: 'Copy the data into a warehouse built for analysis and point the dashboards there', score: 2, effects: { 'analyst happiness': 35, 'customer experience': 10, 'effort': -25 }, feedback: 'This is the standard answer. A separate columnar store, loaded regularly, gives fast reports without touching production, and it can combine several sources.' },
            { label: 'Make the production database bigger so it can do both', score: 1, effects: { 'customer experience': 5, 'effort': -10 }, feedback: 'It helps for a while, but you pay a lot, and reports still compete with customers for the same machine.' },
            { label: 'Let each team export spreadsheets weekly', score: 0, effects: { 'analyst happiness': -15 }, feedback: 'Soon there are five conflicting versions of "total sales" in five spreadsheets.' }
          ] },
        { text: 'Someone asks why not simply use a column store for everything, including the shop’s orders.',
          choices: [
            { label: 'Column stores are slower for many tiny single-row writes and lookups, which is what a shop needs', score: 2, effects: { 'customer experience': 10 }, feedback: 'Correct. Row stores suit OLTP; column stores suit OLAP. Use each for what it is good at.' },
            { label: 'Good idea; column stores are strictly faster', score: 0, effects: { 'customer experience': -25 }, feedback: 'They are faster at scanning a column, but each order write touches every column’s storage, and single-row lookups are not what they are tuned for.' },
            { label: 'Because the law requires two databases', score: 0, effects: { 'effort': -5 }, feedback: 'No law says so. The reason is purely technical.' }
          ] }
      ],
      outro: 'Keep the workloads apart: **a store tuned for transactions, and a copy tuned for questions.**' },

    { type: 'explain', prompt: 'Explain to a colleague why a company copies data into a separate analytics system instead of running reports on the app’s own database.',
      model: 'The app database (OLTP) is tuned for lots of tiny, fast operations on current data, and customers depend on it. Big reports scan millions of rows, use lots of CPU, memory and disk, and slow down checkouts. So we copy the data into a system built for analysis (OLAP), usually a column store, where heavy queries are fast, can combine other data sources, and cannot hurt customers.',
      keywords: ['OLTP', 'OLAP', 'customers', 'slow', 'column', 'copy', 'warehouse'] }
  ],

  flashcards: [
    { q: 'OLTP vs OLAP?', a: 'OLTP is running the business: many small fast transactions on current data. OLAP is analysing it: few big queries over history.' },
    { q: 'Row store vs column store?', a: 'Row store keeps all fields of a record together (good for OLTP). Column store keeps each column together (good for scans and aggregates in OLAP).' },
    { q: 'Why are column stores good for analytics?', a: 'They read only the columns a query needs, compress well because similar values sit together, and scan huge ranges quickly.' },
    { q: 'Why not run reports on the production database?', a: 'Heavy queries compete with customers for CPU, memory, disk and locks, and the row layout makes big scans slow.' }
  ],

  glossary: [
    { term: 'OLTP', def: 'Online transaction processing: handling many small, fast operations on current data, like orders and logins.', like: 'The shop till.' },
    { term: 'OLAP', def: 'Online analytical processing: running big queries over lots of historical data to find patterns and totals.', like: 'The accountant reviewing a year of receipts.' },
    { term: 'Row store', def: 'A database that stores each record’s fields together on disk. Great for fetching or writing a whole record.', like: 'A card index: one card per customer, everything on the card.' },
    { term: 'Column store', def: 'A database that stores each column’s values together on disk. Great for summing or filtering across millions of rows.', aka: ['columnar store'], like: 'A set of lists: one list of all names, one of all prices.' },
    { term: 'Analytics pipeline', def: 'The path data takes from the systems that create it, through cleaning and loading, into a store where it can be analysed.' }
  ],

  takeaways: [
    '**OLTP** runs the business (tiny, fast, current); **OLAP** analyses it (huge, slow-ish, historical).',
    '**Row stores** suit transactions; **column stores** suit analytics: read only the columns you need.',
    'Do not report on production: copy the data to a system built for analysis.',
    'Pipeline shape: **source → extract → clean and load → warehouse → dashboards**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-warehouses', {
  eli5: 'A data warehouse is one big, tidy place where all a company’s data lands so anyone can ask questions across all of it. A data lake is the same idea but keeps raw files first and tidies them later.',

  cards: [
    { kind: 'concept', title: 'The data is everywhere (and nowhere you can use)',
      body: `A growing company has sales in a PostgreSQL database, ad spend in a marketing tool, support tickets in another service, and web clicks in log files. The boss asks: *"Which ad campaign brings the customers who spend the most and complain the least?"*

        To answer, someone must join four systems that were never designed to talk to each other, each with its own format, its own idea of "customer" and its own load limits.

        The fix is to bring copies of everything into **one place** designed for questions. That place is a **data warehouse**. This lesson covers the warehouse, its cheaper and looser cousin the **lake**, and the clever blend called the **lakehouse**.` },

    { kind: 'metaphor', title: 'A central warehouse for a chain of shops',
      body: `A supermarket chain has hundreds of shops. They do not each store everything; goods flow into a **central warehouse**: delivered in bulk, checked, labelled and shelved by type. Anyone planning a promotion can then see exactly what exists, in one tidy place.

        A data warehouse works the same way:

        - Each source system is a shop.
        - Data is **delivered** in bulk (nightly, say), **checked** and **labelled** consistently.
        - Analysts "plan promotions" by querying one clean place.

        Where the metaphor stops: a physical warehouse *moves* the goods. A data warehouse holds **copies**. The shops carry on as before.` },

    { kind: 'concept', title: 'What makes a warehouse a warehouse',
      body: `A data warehouse is a database designed for analysis, not for running an app. Its classic traits:

        - **Subject-oriented:** organised around business topics (sales, customers), not around one app's tables.
        - **Integrated:** data from many sources is cleaned into one consistent form. "UK", "United Kingdom" and "GB" all become one value.
        - **Historical:** it keeps years of history. The shop database might overwrite an old address; the warehouse remembers every version.
        - **Read-optimised:** a column store, loaded in big batches, queried by a few analysts.

        It is the place where "what was our revenue last March?" has **one agreed answer**.` },

    { kind: 'diagram', title: 'A star schema',
      body: 'The standard way to shape warehouse data. A central **fact table** is surrounded by **dimension tables**, like a star.',
      nodes: [
        { id: 'dp', label: 'dim_product', icon: '📦', x: 1, y: 0, tone: 'info' },
        { id: 'dd', label: 'dim_date', icon: '📅', x: 0, y: 1, tone: 'info' },
        { id: 'f', label: 'fact_sales', icon: '⭐', x: 1, y: 1, tone: 'accent' },
        { id: 'dc', label: 'dim_customer', icon: '🧑', x: 2, y: 1, tone: 'info' },
        { id: 'ds', label: 'dim_store', icon: '🏬', x: 1, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'f', to: 'dp', label: 'product_id' },
        { from: 'f', to: 'dd', label: 'date_id' },
        { from: 'f', to: 'dc', label: 'customer_id' },
        { from: 'f', to: 'ds', label: 'store_id' }
      ],
      caption: 'Facts are the things that happened. Dimensions describe the who, what, where and when of each fact.' },

    { kind: 'concept', title: 'Facts and dimensions',
      body: `Every question an analyst asks has the same shape: **"measure X, broken down by Y and Z"**. Revenue (the measure) by month and by country (the breakdowns). A star schema is built to match.

        - A **fact table** holds one row per **event** (a sale, a click, a delivery). It is mostly **numbers** (quantity, price, duration) plus **keys** pointing at dimensions. It is huge: billions of rows.
        - A **dimension table** holds the **descriptions**: customer name and country, product category, the calendar date with its month and weekday. It is small and wide.

        Analysts pick a measure from the fact table and group by columns from the dimensions. Simple structure, fast queries, and easy to explain to non-engineers.` },

    { kind: 'code', title: 'A question, asked of the star',
      body: 'Revenue per country per month. Tap the lines to see the roles.',
      code: { lang: 'sql', src: `
        SELECT c.country, d.month, SUM(f.total) AS revenue
        FROM fact_sales f
        JOIN dim_customer c ON c.id = f.customer_id
        JOIN dim_date d     ON d.id = f.date_id
        WHERE d.year = 2025
        GROUP BY c.country, d.month
        ORDER BY revenue DESC;`,
        notes: {
          1: 'The **measure** (`total`) comes from the fact table; the breakdowns (`country`, `month`) come from dimensions.',
          2: 'Start from the huge fact table: one row per sale.',
          3: 'Join to the customer dimension to find each sale’s country. One join per breakdown.',
          5: 'Filter using a dimension column: the date dimension already knows the year.',
          6: 'Group by the dimension attributes, and the database sums the facts within each group.'
        } } },

    { kind: 'concept', title: 'Data lakes: dump first, decide later',
      body: `A warehouse demands that data is **cleaned and shaped before it goes in** ("schema-on-write"). That takes effort, and you must decide up front what the data will be used for.

        A **data lake** flips it. You dump **raw files** as they arrive (logs, JSON, CSV, images, database exports) into cheap storage, usually cloud **object storage** (the file storage service covered in the Servers world). You decide the structure **when you read** it ("schema-on-read").

        - **Good:** very cheap, takes any data, nothing is thrown away, data scientists love raw material.
        - **Bad:** no guarantees. Without care, a lake becomes a **data swamp**: nobody knows what is in it, which files are current, or whether they can be trusted.` },

    { kind: 'compare', title: 'Warehouse, lake and lakehouse',
      body: 'The **lakehouse** tries to get the best of both: cheap lake storage, with warehouse-style tables, transactions and SQL layered on top.',
      cols: ['Warehouse', 'Lake', 'Lakehouse'],
      rows: [
        ['Stores', 'Tidy tables', 'Raw files of any kind', 'Files plus a table layer'],
        ['Structure applied', 'On the way in', 'When you read', 'Table format on files'],
        ['Cost of storage', 'Higher', 'Low', 'Low'],
        ['Reliability', 'High, curated', 'Up to you', 'Transactions on files'],
        ['Best for', 'Business reports (BI)', 'Raw data, ML, archives', 'Both, in one place']
      ],
      note: 'The table layer in a lakehouse comes from open formats such as Delta Lake, Apache Iceberg and Apache Hudi. We only name them here.' },

    { kind: 'realworld', title: 'Snowflake, BigQuery and Redshift',
      body: `You rarely build a warehouse from scratch today. Three big names rent you one:

        - **Snowflake:** an independent cloud data platform that runs on the major clouds. It separates **storage** from **compute**, so you can add processing power without copying data.
        - **Google BigQuery:** Google Cloud's serverless warehouse. You write SQL; Google decides which machines run it.
        - **Amazon Redshift:** Amazon's warehouse, tightly integrated with the rest of AWS.

        They all share the same recipe: columnar storage, SQL, scaling by spreading a query across many machines. Choosing between them is usually about which cloud you already use. Older on-premises warehouses exist too.` },

    { kind: 'pitfall', title: 'Three ways a warehouse project goes sour',
      body: `- **Nobody agrees on definitions.** "Active customer" means one thing to marketing and another to finance, so two dashboards show different numbers. Fix: define each measure **once**, in the warehouse.
        - **A swamp, not a lake.** Files pile up with no names, owners or freshness. Fix: catalogue what is there, and use a table format or a clear folder convention.
        - **Everything is real-time.** Dashboards that refresh every second cost much more than ones refreshed hourly, and nobody was reading them that fast anyway.

        Start with the questions people actually ask, and build the tables that answer them.` }
  ],

  activities: [
    { type: 'bucket', after: 4, prompt: 'Is this table a fact or a dimension in a sales star schema?', buckets: ['Fact table', 'Dimension table'],
      items: [['One row per individual sale, with quantity and price', 0], ['Customer name, city and country', 1], ['Calendar dates with month, weekday and year', 1], ['One row per website click', 0], ['Product name, brand and category', 1], ['One row per delivery with its cost in pence', 0]],
      explain: 'Facts record events and carry numbers to add up. Dimensions describe the who, what, where and when, and are small and relatively fixed.' },

    { type: 'mcq', after: 5, q: 'In the star-schema query, why does the database join `fact_sales` to `dim_customer`?',
      options: ['To find each sale’s country so sales can be grouped by it', 'To check that the customer paid their bill', 'To copy the customers into the fact table', 'To make the query run in one row'],
      answer: 0,
      why: [null, 'The join only looks up descriptions. Nothing is checked about payment.', 'Joins read data; they do not copy it anywhere.', 'The result has many rows, one per country and month.'],
      explain: 'The fact table holds only a customer key. The country lives in the dimension, so you join to reach it and group by it.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Fact table', 'One row per event, mostly numbers'], ['Dimension table', 'Descriptions: who, what, where, when'], ['Schema-on-write', 'Clean and shape data before storing it'], ['Schema-on-read', 'Store raw, decide structure at query time'], ['Lakehouse', 'Lake storage with warehouse-style tables']],
      explain: 'Warehouses use schema-on-write, lakes use schema-on-read, and the lakehouse adds a table layer on lake files to get reliability without losing the low cost.' },

    { type: 'tf', statement: 'A data warehouse moves data out of the source systems, so the shop database no longer holds the orders.', answer: false,
      explain: 'The warehouse holds **copies**. The source systems keep running as normal, and data is loaded on a schedule.' },

    { type: 'multi', q: 'Which are typical features of a data lake?',
      options: ['Stores raw files of many kinds', 'Cheap storage, often in the cloud', 'Structure is decided when you read the data', 'Guarantees clean, consistent data automatically', 'Requires every file to fit one fixed table first'],
      answers: [0, 1, 2],
      explain: 'A lake accepts anything cheaply and defers structure. It does **not** guarantee quality on its own, which is how swamps happen, and it does not force a table shape up front.' },

    { type: 'short', q: 'In a star schema, what is the name of the central table that holds one row per event? (one word)', accept: ['fact', 'facts', 'fact table', 'fact tables'], hint: 'The opposite of a dimension.',
      explain: 'The **fact** table lists what happened (sales, clicks, deliveries), with keys pointing to the dimensions that describe each event.' },

    { type: 'scenario', title: 'Where does this data go?', intro: 'You are the first data engineer at a fast-growing subscription app. The founders want answers about customers, but data is scattered in the app database, a payments tool, support emails and raw web logs.',
      meters: { 'insight': 20, 'cost': 70, 'trust in numbers': 40 },
      steps: [
        { text: 'The finance director wants one trusted monthly revenue figure. Where should it live?',
          choices: [
            { label: 'In the warehouse, in a curated fact table with a single agreed definition of revenue', score: 2, effects: { 'trust in numbers': 35, 'insight': 20, 'cost': -10 }, feedback: 'One definition, one place. Everyone now quotes the same number, and the work of defining it is done once.' },
            { label: 'In a spreadsheet maintained by finance', score: 0, effects: { 'trust in numbers': -15 }, feedback: 'Soon a second spreadsheet appears with a slightly different figure, and nobody knows which is right.' },
            { label: 'Raw in the lake; analysts will work it out', score: 1, effects: { 'insight': 5, 'trust in numbers': -10 }, feedback: 'Fine for exploration, but a board-level number needs a curated, tested definition rather than every analyst’s own formula.' }
          ] },
        { text: 'Web logs arrive at 200 GB a day in messy JSON. Nobody is sure yet what they will be used for. Where do they go?',
          choices: [
            { label: 'Into the lake as raw files, organised by date; promote useful parts to the warehouse later', score: 2, effects: { 'cost': 10, 'insight': 15 }, feedback: 'Cheap, nothing is lost, and you decide the structure once you know the questions. Organising by date keeps the lake from becoming a swamp.' },
            { label: 'Force them all into warehouse tables right now', score: 1, effects: { 'cost': -25, 'insight': 5 }, feedback: 'You pay a lot to clean and store data nobody has asked about yet, and you will redo the shape when needs change.' },
            { label: 'Delete them after a week to save money', score: 0, effects: { 'insight': -20 }, feedback: 'Raw data is cheap to keep and impossible to recreate. Deleting it throws away questions you have not thought of yet.' }
          ] },
        { text: 'A year on, you want warehouse-style reliability on the lake files without copying everything into a separate system. What do you reach for?',
          choices: [
            { label: 'A lakehouse table format (such as Delta Lake or Iceberg) on top of the lake files', score: 2, effects: { 'trust in numbers': 15, 'cost': 5 }, feedback: 'It brings transactions, schemas and SQL to files in cheap storage. One copy of the data serves both roles.' },
            { label: 'Delete the lake and move everything to a row-store database', score: 0, effects: { 'cost': -30 }, feedback: 'A row store is the wrong tool for scanning huge history, and you would lose the cheap raw archive.' },
            { label: 'Keep copying everything twice', score: 1, effects: { 'cost': -15 }, feedback: 'It works, but two copies drift apart, and you pay twice to store them.' }
          ] }
      ],
      outro: 'Curated and trusted for business numbers; cheap and raw for everything else; a table layer if you want both.' },

    { type: 'explain', prompt: 'In your own words: what is the difference between a data warehouse and a data lake, and why do some companies use both?',
      model: 'A warehouse stores cleaned, structured tables that are ready for business reports, with the shape decided before loading. A lake stores raw files of any kind cheaply and decides the structure only when you read them. Companies use both because the warehouse gives trusted numbers for dashboards, while the lake keeps everything raw and cheap for exploration and machine learning. A lakehouse tries to combine the two.',
      keywords: ['warehouse', 'lake', 'raw', 'structured', 'cheap', 'schema', 'reports', 'lakehouse'] }
  ],

  flashcards: [
    { q: 'What is a data warehouse?', a: 'A database built for analysis that holds cleaned, integrated copies of data from many sources, including history, organised so reports are fast.' },
    { q: 'What are facts and dimensions in a star schema?', a: 'A fact table has one row per event with numbers and keys. Dimension tables hold the descriptions (who, what, where, when).' },
    { q: 'Schema-on-write vs schema-on-read?', a: 'Schema-on-write (warehouse): clean and shape before storing. Schema-on-read (lake): store raw, impose structure when querying.' },
    { q: 'What is a lakehouse?', a: 'Lake-style cheap file storage with a table layer (such as Delta Lake or Iceberg) that gives warehouse-style transactions and SQL.' },
    { q: 'Name three managed warehouses.', a: 'Snowflake, Google BigQuery and Amazon Redshift: columnar, SQL-driven, scaling across many machines.' }
  ],

  glossary: [
    { term: 'Data warehouse', def: 'A central database, built for analysis, holding cleaned copies of data from many source systems over time.', like: 'A supermarket chain’s central warehouse.' },
    { term: 'Star schema', def: 'A way of shaping warehouse tables: one central fact table surrounded by dimension tables.', like: 'A hub with spokes.' },
    { term: 'Fact table', def: 'The big table in a star schema, with one row per event (a sale, a click) and mostly numbers and keys.' },
    { term: 'Dimension table', def: 'A smaller table describing the who, what, where or when of facts, such as customers, products or dates.' },
    { term: 'Data lake', def: 'Cheap storage of raw data files of any kind, with structure decided when you read them.', like: 'A big pond you pour everything into.' },
    { term: 'Lakehouse', def: 'A lake whose files are managed with a table layer that adds transactions, schemas and fast SQL, so it works like a warehouse too.' }
  ],

  takeaways: [
    'A **warehouse** is one clean, historical, analysis-ready copy of the company’s data.',
    '**Star schema:** a **fact** table (events, numbers) ringed by **dimensions** (descriptions).',
    'A **lake** keeps raw files cheaply and applies structure on read; unmanaged, it turns into a swamp.',
    'A **lakehouse** adds tables and transactions to lake files. Snowflake, BigQuery and Redshift are managed warehouses.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-etl', {
  eli5: 'A pipeline is a conveyor belt that picks data up where it is made, tidies it and drops it where analysts can use it. ETL tidies first and then loads; ELT loads first and tidies inside the warehouse.',

  cards: [
    { kind: 'concept', title: 'Why the sales number is wrong on Tuesdays',
      body: `Every night at 2am, a little program copies yesterday's orders into the warehouse. One Tuesday the dashboard says sales **doubled**. Everyone celebrates. Then somebody notices the program had crashed halfway, someone restarted it, and it copied the first half of the orders **twice**.

        The data had to get from the shop to the warehouse somehow, and that "somehow" is a **data pipeline**. Moving data is easy. Moving it **correctly, repeatedly and on schedule**, even when things crash, is the actual job.

        This lesson is about the shape of those pipelines, and the habits that stop a restart from doubling your revenue.` },

    { kind: 'steps', title: 'E, T, L: the three verbs',
      body: 'The classic recipe has three stages. The acronym tells you the order.',
      steps: [
        { title: 'Extract', body: 'Read the data from where it lives: a database, an API, files, logs. Often you copy only what is **new or changed** since last time, not the whole thing.' },
        { title: 'Transform', body: 'Clean and reshape it: fix formats (dates, currencies), remove duplicates, handle missing values, join sources together, and rename things to the warehouse’s agreed names.' },
        { title: 'Load', body: 'Write the result into the warehouse (or lake), usually in bulk, into the tables analysts will query.' }
      ],
      note: 'The messy middle stage is the one that takes 80% of the effort.' },

    { kind: 'metaphor', title: 'Moving house',
      body: `**Extract:** take everything out of the old house and into the van.

        **Transform:** decide what is rubbish, repack fragile things, label every box by room.

        **Load:** carry the labelled boxes into the new house.

        Now the interesting question: do you repack in the van **before** arriving, or dump the boxes in the new hallway and sort them **there**, where you have plenty of space and all your tools? Both work. Companies used to do the first (ETL). More and more do the second (ELT).` },

    { kind: 'compare', title: 'ETL versus ELT',
      body: 'Same three letters, different order, and a different place where the clever work happens.',
      cols: ['ETL', 'ELT'],
      rows: [
        ['Order', 'Extract, transform, then load', 'Extract, load, then transform'],
        ['Transform runs on', 'A separate processing server', 'Inside the warehouse itself'],
        ['Raw data kept?', 'Often not; only the result', 'Yes, raw copy lands first'],
        ['Change your mind later', 'Re-extract from the source', 'Re-run SQL on the raw data'],
        ['Best when', 'Warehouse is small or costly', 'Warehouse is powerful and cheap']
      ] },

    { kind: 'concept', title: 'Why the order flipped',
      body: `ETL made sense when warehouses were **expensive and limited**: you could not afford to store messy data or waste the warehouse's power on cleaning. So you cleaned on a separate machine and loaded only the finished product.

        Two things changed:

        - **Storage became cheap** and cloud warehouses (BigQuery, Snowflake, Redshift) can scale their power up and down. Cleaning data *inside* the warehouse is fast.
        - **Raw data became valuable.** If you only keep the cleaned version, a new question tomorrow ("what about the field we dropped?") needs a fresh extract. With ELT you still have the raw copy.

        So today the usual pattern is: land raw data first, then transform it with **SQL inside the warehouse**. Tools like dbt popularised writing those transformations as versioned SQL files.` },

    { kind: 'diagram', title: 'A pipeline is a graph of tasks',
      body: 'Real pipelines are not one script. They are many small tasks with **dependencies**: a task may only run when the ones above it have finished.',
      nodes: [
        { id: 'e1', label: 'Extract orders', icon: '📥', x: 0, y: 0 },
        { id: 'e2', label: 'Extract customers', icon: '📥', x: 2, y: 0 },
        { id: 'clean', label: 'Clean + join', icon: '🧹', x: 1, y: 1, tone: 'info' },
        { id: 'load', label: 'Load fact_sales', icon: '🏛️', x: 1, y: 2, tone: 'accent' },
        { id: 'check', label: 'Quality checks', icon: '✅', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'e1', to: 'clean' },
        { from: 'e2', to: 'clean' },
        { from: 'clean', to: 'load' },
        { from: 'load', to: 'check' }
      ],
      caption: 'Each box is a task. Arrows mean "must finish first". A tool that runs this graph is called an orchestrator.' },

    { kind: 'concept', title: 'Schedules and orchestration',
      body: `Most analytics pipelines run in **batches** on a **schedule**: nightly, hourly, every fifteen minutes. A simple scheduler (like cron on a Linux server) can start one script at 2am.

        But as pipelines grow you need more: run task B only after task A succeeds, **retry** a step that failed, alert someone if it keeps failing, re-run last Tuesday, and see what is stuck. That is the job of an **orchestrator**, a tool that runs a graph of tasks with dependencies, retries and a dashboard. Apache Airflow is the best-known example; others work in the same spirit.

        An orchestrator does not do the data work itself. It is the conductor, not the orchestra.` },

    { kind: 'code', title: 'An idempotent load: safe to run twice',
      body: 'Remember **idempotent**: running it twice leaves the same state as once. A pipeline must be, because crashes and re-runs happen. Tap the lines.',
      code: { lang: 'sql', src: `
        BEGIN;
        DELETE FROM fact_sales
         WHERE sale_date = '2025-03-01';
        INSERT INTO fact_sales
          SELECT * FROM staging_orders
           WHERE sale_date = '2025-03-01';
        COMMIT;`,
        notes: {
          2: 'First **remove** whatever is already there for this one day. On the first run there is nothing; on a re-run, it clears the half-loaded data.',
          4: 'Then load that day fresh. The result is the same however many times this job runs.',
          7: 'Both steps commit together, so nobody sees a day with half its rows.'
        } },
      note: 'The opposite, a bare INSERT that always appends, doubles the data every time you re-run it.' },

    { kind: 'pitfall', title: 'Bad data in, bad dashboards out',
      body: `A pipeline that runs without errors can still deliver garbage: a source system changed a column's meaning, a country code arrived blank, yesterday's file never arrived so the warehouse quietly shows zero sales.

        Good pipelines add **data quality checks**, tiny automated tests on the data:

        - **Row counts:** did roughly as many rows arrive as usual?
        - **Nulls and ranges:** no blank customer IDs, no negative prices.
        - **Uniqueness:** no duplicate order IDs.
        - **Freshness:** is the newest row from today?

        When a check fails, **stop and alert**, rather than load bad data silently. A late dashboard is annoying; a wrong one gets trusted.` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put the three ETL stages in order.',
      items: ['Extract data from the source', 'Transform it: clean, reshape, join', 'Load it into the warehouse'],
      explain: 'The letters spell the order. In ELT the last two swap: you load raw data, then transform it inside the warehouse.' },

    { type: 'bucket', after: 3, prompt: 'Which stage does each job belong to?', buckets: ['Extract', 'Transform', 'Load'],
      items: [['Read yesterday’s new orders from the shop database', 0], ['Convert all dates to one format', 1], ['Remove duplicate customer rows', 1], ['Bulk-write the result into fact_sales', 2], ['Download a CSV from a partner’s server', 0], ['Join orders with customer details', 1]],
      explain: 'Extract = get the data out; Transform = make it clean and consistent; Load = put it where analysts query.' },

    { type: 'tf', after: 7, statement: 'A pipeline job that appends rows with a plain INSERT is safe to re-run after a crash.', answer: false,
      explain: 'Re-running would append the same rows again and double the data. An idempotent job replaces or merges, so a re-run gives the same result as a single run.' },

    { type: 'spot', prompt: 'This nightly job sometimes crashes and gets re-run. Tap the line that makes re-runs dangerous.',
      code: { lang: 'py', src: `
        def nightly_load(day):
            rows = extract_orders(day)
            clean = [transform(r) for r in rows]
            warehouse.append("fact_sales", clean)
            check_row_counts(day)` },
      lines: [4],
      explain: 'Line 4 appends the day’s rows every time it runs. After a re-run, that day appears twice. Replacing that day’s partition, or merging by order ID, would make it idempotent.' },

    { type: 'mcq', q: 'Why have many teams moved from ETL towards ELT?',
      options: ['Warehouses are powerful and storage cheap, so load raw first', 'ELT never needs any transformation step at all', 'ETL can no longer load data into modern databases', 'Transforming data has become illegal on separate servers'],
      answer: 0,
      why: [null, 'ELT still transforms. It just does it after loading, inside the warehouse.', 'ETL still works. It is a trade-off, not a broken technique.', 'No such rule exists.'],
      explain: 'When storage is cheap and the warehouse can scale on demand, landing raw data first costs little and keeps your options open. You can redo transformations without going back to the source.' },

    { type: 'ab', q: 'Which loader is safer for a job that may run twice?',
      a: { lang: 'sql', label: 'Replace the day', src: `
        DELETE FROM fact_sales WHERE sale_date = :day;
        INSERT INTO fact_sales
          SELECT * FROM staging WHERE sale_date = :day;` },
      b: { lang: 'sql', label: 'Just append', src: `
        INSERT INTO fact_sales
          SELECT * FROM staging WHERE sale_date = :day;` },
      answer: 'a',
      explain: 'Deleting that day first means a re-run ends in the same state as a single run. The plain insert piles up duplicates each time.' },

    { type: 'multi', q: 'Which of these are sensible automated data quality checks?',
      options: ['Today’s row count is within a normal range of recent days', 'No order ID appears twice', 'No price is negative', 'The job finished without a program error', 'The dashboard colours look nice'],
      answers: [0, 1, 2],
      explain: 'A job can finish with no error and still load garbage. Good checks test the **data**: volume, uniqueness and valid values. Nice colours and "no crash" say nothing about correctness.' },

    { type: 'scenario', title: 'The doubled-revenue Tuesday', intro: 'You inherit a nightly pipeline. This morning the dashboard shows twice the real revenue for yesterday, and the CFO has already mentioned it in an email to the board. Fix the problem, then the system.',
      meters: { 'trust in data': 30, 'stress': 70, 'time': 60 },
      steps: [
        { text: 'First, what do you do about the wrong number?',
          choices: [
            { label: 'Find the cause in the job history, correct the day’s data and tell everyone who saw the number', score: 2, effects: { 'trust in data': 20, 'stress': -15, 'time': -15 }, feedback: 'Cause first, then a clear correction. The job log shows a crash and a restart, with the first half loaded twice.' },
            { label: 'Quietly edit the number in the dashboard', score: 0, effects: { 'trust in data': -25 }, feedback: 'The warehouse and the dashboard now disagree, and the next run will break again. People who trusted the old number are never told.' },
            { label: 'Wait; hopefully nobody notices', score: 0, effects: { 'trust in data': -30, 'stress': 10 }, feedback: 'The CFO already noticed. Silence makes it worse.' }
          ] },
        { text: 'How do you stop the restart-doubles-data bug from happening again?',
          choices: [
            { label: 'Make the load idempotent: replace that day’s partition (or merge by key) in one transaction', score: 2, effects: { 'trust in data': 25, 'time': -15 }, feedback: 'Now a crash and a re-run end in the same state as a clean run. The class of bug is gone.' },
            { label: 'Add a note to the runbook: "never restart this job"', score: 0, effects: { 'trust in data': -10 }, feedback: 'Jobs crash. A rule that depends on nobody ever restarting is a rule that will be broken at 3am.' },
            { label: 'Run it twice and hope the numbers average out', score: 0, effects: { 'trust in data': -20 }, feedback: 'That would simply guarantee duplicates.' }
          ] },
        { text: 'What would have caught the duplicate before the CFO did?',
          choices: [
            { label: 'Data quality checks: row counts against a normal range and a uniqueness check on order ID, failing the pipeline', score: 2, effects: { 'trust in data': 25, 'stress': -20 }, feedback: 'A check that says "twice the usual rows and duplicate IDs" would have stopped the load before the dashboard updated.' },
            { label: 'A bigger warehouse', score: 0, effects: { 'time': -10 }, feedback: 'Power does not help. The problem is correctness, not speed.' },
            { label: 'Running the job more often', score: 0, effects: { 'trust in data': -5 }, feedback: 'More runs means more chances to duplicate.' }
          ] }
      ],
      outro: 'A good pipeline is **idempotent, checked and observable**: it survives restarts, notices bad data and tells you when it fails.' },

    { type: 'short', q: 'What is the word for a pipeline task that is safe to run twice, giving the same final state as running it once?', accept: ['idempotent', 'idempotence', 'idempotency'], hint: 'You met it in the HTTP lesson, too.',
      explain: '**Idempotent**: the same end state however many times it runs. It makes retries and re-runs harmless.' }
  ],

  flashcards: [
    { q: 'What do E, T and L stand for?', a: 'Extract (read data from the source), Transform (clean and reshape), Load (write into the warehouse).' },
    { q: 'ETL vs ELT?', a: 'ETL transforms before loading, usually on a separate server. ELT loads raw data first, then transforms inside the warehouse, which keeps the raw copy.' },
    { q: 'Why did ELT become popular?', a: 'Storage became cheap and cloud warehouses became powerful and scalable, so keeping raw data and transforming in place costs little.' },
    { q: 'What does an orchestrator do?', a: 'It runs a graph of pipeline tasks on a schedule, respecting dependencies, retrying failures and alerting you. It does not do the data work itself.' },
    { q: 'Why must pipeline jobs be idempotent?', a: 'Because crashes and re-runs happen. An idempotent job gives the same result run once or ten times, so re-runs cannot duplicate data.' }
  ],

  glossary: [
    { term: 'ETL', def: 'Extract, Transform, Load: take data from sources, clean it on a separate system, then load the finished result into the warehouse.', like: 'Repacking boxes in the van before you arrive.' },
    { term: 'ELT', def: 'Extract, Load, Transform: copy raw data into the warehouse first, then transform it there with SQL.', like: 'Dumping boxes in the new hallway and sorting them there.' },
    { term: 'Data pipeline', def: 'An automated sequence of steps that moves data from sources to a destination, cleaning it on the way.', like: 'A conveyor belt.' },
    { term: 'Orchestrator', def: 'A tool that schedules and runs a graph of pipeline tasks, handling dependencies, retries and alerts.', like: 'The conductor, not the orchestra.' },
    { term: 'Batch job', def: 'Work done on a chunk of data at a time, on a schedule such as nightly or hourly, rather than continuously.' }
  ],

  takeaways: [
    'A pipeline is **Extract → Transform → Load**; ELT swaps the last two and keeps the raw data.',
    'Pipelines are **graphs of tasks** on a schedule, run by an orchestrator that handles dependencies and retries.',
    'Make every job **idempotent**: replace or merge, never blindly append.',
    'Add **data quality checks** (counts, nulls, duplicates, freshness) and fail loudly.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-mapreduce-hadoop', {
  eli5: 'To count words in a mountain of text, split it among a thousand helpers who each count their own pile, then add up their tallies. Map, shuffle and reduce are the three steps of that idea.',

  cards: [
    { kind: 'concept', title: 'Ten terabytes and one slow machine',
      body: `Your company has collected ten terabytes of web logs (that is 10,000 gigabytes). You want to know which pages are visited most.

        One powerful machine reading a disk at roughly 100 megabytes per second would need around **28 hours** just to *read* the data, before doing any counting. And the data will not fit in the machine's memory anyway.

        You cannot make one machine much faster. But you can use **a thousand ordinary machines**, each reading a thousandth of the data. Then the reading takes about a minute and a half.

        The hard part is not owning the machines. It is writing the program so that a thousand machines can **cooperate**, and carry on when a few of them break.` },

    { kind: 'metaphor', title: 'Counting votes in a general election',
      body: `Nobody counts a national election in one room. Each **polling station** counts its own ballot papers and writes a tally: "Alice 312, Bob 255".

        Those tallies are sent to the regional office, which collects **everything about Alice together**, and everything about Bob together. Then each office adds up its candidate's numbers.

        Three stages:

        1. **Count locally**, where the ballots already are.
        2. **Regroup**: send each candidate's partial tallies to one place.
        3. **Add up** the partial tallies.

        That is **MapReduce**, in a ballot box. Where the metaphor stops: in computing, the "polling stations" are machines that sometimes crash mid-count, and the framework must quietly give their pile to someone else.` },

    { kind: 'steps', title: 'Map, shuffle, reduce',
      body: 'The programmer writes two small functions. The framework does everything else. Word count is the classic example.',
      steps: [
        { title: 'Map', body: 'Each machine reads its **own slice** of the data and runs your `map` function on every record. For word count, it emits a pair for each word: `("the", 1)`, `("cat", 1)`, `("the", 1)`.' },
        { title: 'Shuffle', body: 'The framework **groups the pairs by key** and sends all pairs with the same key to the same machine. Every `"the"` ends up together. This step moves data across the network, and it is the expensive one.' },
        { title: 'Reduce', body: 'Each machine runs your `reduce` function on one key at a time with all its values: `("the", [1, 1, 1, …])` becomes `("the", 4,031)`.' },
        { title: 'Output', body: 'The reducers write their results out as files. Together they hold the answer for the whole dataset.' }
      ] },

    { kind: 'code', title: 'Word count: the two functions',
      body: 'This is everything the programmer writes. Tap the lines.',
      code: { lang: 'js', src: `
        function map(line) {
          for (const word of line.toLowerCase().split(/\\W+/)) {
            if (word) emit(word, 1);
          }
        }

        function reduce(word, counts) {
          emit(word, counts.reduce((a, b) => a + b, 0));
        }`,
        notes: {
          1: 'Called once per line of input, on whichever machine holds that line.',
          3: '`emit(key, value)` outputs a pair. The framework collects them all. Note: it emits `1` per occurrence and does **no** adding here.',
          7: 'Called once per word, with the list of every `1` emitted for that word, from every machine.',
          8: 'Add them up. Because each word’s counts are independent, a thousand reducers can work at the same time.'
        } },
      note: 'The lab that follows runs this word count across workers so you can watch the three stages.' },

    { kind: 'diagram', title: 'The data flow',
      body: 'Three input blocks, three mappers, two reducers. The crossing arrows in the middle are the **shuffle**.',
      nodes: [
        { id: 'b1', label: 'Block 1', icon: '📄', x: 0, y: 0 },
        { id: 'b2', label: 'Block 2', icon: '📄', x: 1, y: 0 },
        { id: 'b3', label: 'Block 3', icon: '📄', x: 2, y: 0 },
        { id: 'm1', label: 'Map 1', x: 0, y: 1, tone: 'info' },
        { id: 'm2', label: 'Map 2', x: 1, y: 1, tone: 'info' },
        { id: 'm3', label: 'Map 3', x: 2, y: 1, tone: 'info' },
        { id: 'r1', label: 'Reduce: a–m', x: 0, y: 3, tone: 'accent' },
        { id: 'r2', label: 'Reduce: n–z', x: 2, y: 3, tone: 'accent' }
      ],
      edges: [
        { from: 'b1', to: 'm1' }, { from: 'b2', to: 'm2' }, { from: 'b3', to: 'm3' },
        { from: 'm1', to: 'r1', label: 'shuffle', dashed: true }, { from: 'm1', to: 'r2', dashed: true },
        { from: 'm2', to: 'r1', dashed: true }, { from: 'm2', to: 'r2', dashed: true },
        { from: 'm3', to: 'r1', dashed: true }, { from: 'm3', to: 'r2', dashed: true }
      ],
      caption: 'Every mapper may hold words for every reducer, so mappers send pieces to all reducers.' },

    { kind: 'concept', title: 'HDFS: move the code, not the data',
      body: `Where does the data live in the first place? On a cluster you need a **distributed file system**. Hadoop's is **HDFS** (Hadoop Distributed File System):

        - A big file is cut into large **blocks** (128 MB is a common size) spread across many machines.
        - Each block is **copied to several machines** (three copies is the usual default), so losing a machine loses nothing.
        - A central **name node** keeps the map of which block lives where.

        Here is the clever bit. Moving ten terabytes over the network is slow. Moving a small program is quick. So Hadoop **sends the map code to the machines that already hold the blocks** and runs it right there. This is called **data locality**, and it is the heart of why MapReduce scaled.` },

    { kind: 'history', title: 'A paper, an elephant and a decade',
      body: `Google described its approach in a 2004 paper on MapReduce, a few months after a paper on its file system. Open-source engineers built the same ideas as **Apache Hadoop**, named after a toy elephant belonging to one creator's child. Yahoo and many others adopted it.

        Hadoop's big win was **commodity hardware**: you no longer needed a million-pound supercomputer. Rack up cheap servers, accept that some will die every week, and let software handle the failures. If a machine dies mid-job, its tasks are simply restarted on another machine holding a copy of the block.

        For a decade, "big data" and "Hadoop" were nearly synonyms.` },

    { kind: 'pitfall', title: 'Why plain MapReduce fell out of fashion',
      body: `MapReduce has real weaknesses:

        - **It writes to disk between every stage.** Safe against crashes, but slow. A task that needs ten rounds of map-reduce, like many machine-learning algorithms, pays for ten disk round trips.
        - **It is verbose.** Even simple questions need a lot of code compared with a line of SQL.
        - **Interactive questions are painful.** Jobs take minutes to start and run, so you cannot explore data casually.

        The *idea* (split the work, move code to data, group by key) survived and is everywhere. But for most new work, engines that keep data in memory and understand SQL, which is the next lesson, replaced hand-written MapReduce.` },

    { kind: 'realworld', title: 'Where Hadoop fits today',
      body: `Hadoop is no longer the default for new projects, but it is not gone:

        - **HDFS and YARN** (its resource manager) still run in many company data centres.
        - **Hive** lets people run SQL over Hadoop data, translating it to jobs behind the scenes.
        - Newer engines such as Spark often run **on top of** a Hadoop cluster.
        - Many companies moved to **cloud object storage** plus managed warehouses and Spark, so they no longer run clusters themselves.

        Honest summary: you will meet Hadoop in older systems and interviews, and the MapReduce thinking underlies almost every big data tool you will use.` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the stages of a MapReduce job in order.',
      items: ['Input is split into blocks across machines', 'Map: each machine processes its own block', 'Shuffle: pairs are grouped by key and sent over the network', 'Reduce: each key’s values are combined', 'Results are written out'],
      explain: 'Map works where the data already is; shuffle brings matching keys together; reduce combines them. The shuffle is the stage that moves the most data.' },

    { type: 'mcq', after: 4, q: 'In word count, what does the shuffle step guarantee?',
      options: ['All pairs for the same word arrive at the same reducer', 'Every word is checked for spelling mistakes', 'The input is read in random order, to be fair', 'Each reducer receives exactly the same number of words'],
      answer: 0,
      why: [null, 'Shuffle never looks at meaning, only at keys.', '"Shuffle" does not refer to randomness; it is about regrouping by key.', 'Counts per reducer depend on the data, not on a fixed share.'],
      explain: 'Reduce can only add up a word’s counts if they are all in one place. The shuffle groups every pair by key and delivers each group to a single reducer.' },

    { type: 'tf', after: 5, statement: 'Hadoop moves the data to wherever the program is running, because programs are too big to move.', answer: false,
      explain: 'It is the other way round: the data is huge and the program is small, so Hadoop sends the code to the machines that already store the blocks. That is data locality.' },

    { type: 'estimate', q: 'One disk reads about 100 MB/s. Roughly how many seconds does it take to read 1 terabyte (1,000,000 MB) from a single disk?',
      answer: 10000, unit: 'seconds', tolerance: 2,
      explain: '1,000,000 MB ÷ 100 MB/s = 10,000 seconds, about 2.8 hours. Spread over 1,000 disks reading in parallel, that falls to about 10 seconds. That is the whole motivation.' },

    { type: 'cloze', text: 'In word count, the {{map}} function emits ("word", 1) for every word, the {{shuffle}} groups pairs by key, and the {{reduce}} function adds the numbers up. Data is stored in blocks on {{HDFS}}.',
      distractors: ['SQL', 'index', 'cache'],
      explain: 'Map and reduce are the two functions you write. Shuffle is done by the framework. HDFS is where the blocks live.' },

    { type: 'bucket', prompt: 'Which stage of MapReduce does each action belong to?', buckets: ['Map', 'Shuffle', 'Reduce'],
      items: [['Split a line of text into words', 0], ['Send all ("cat", 1) pairs to the same machine', 1], ['Add up the 1s for the word "cat"', 2], ['Emit ("dog", 1) for each time dog appears', 0], ['Move data across the network between machines', 1], ['Produce the final count for a key', 2]],
      explain: 'Map turns each input record into key-value pairs; shuffle regroups them by key; reduce collapses each group into a result.' },

    { type: 'spot', prompt: 'A developer writes a word-count mapper. Tap the line that breaks the idea of MapReduce.',
      code: { lang: 'js', src: `
        function map(line) {
          const counts = {};
          for (const w of line.split(" ")) {
            counts[w] = (counts[w] || 0) + 1;
          }
          emit("everything", counts);
        }` },
      lines: [6],
      explain: 'Emitting everything under a single key sends all the data to one reducer, which becomes a bottleneck and defeats the parallelism. The key should be the word itself, so work spreads across many reducers.' },

    { type: 'multi', q: 'Which of these are true of HDFS?',
      options: ['Files are split into large blocks', 'Blocks are copied to several machines', 'A name node tracks where blocks are', 'It requires one huge expensive machine', 'Code is sent to the data rather than data to the code'],
      answers: [0, 1, 2, 4],
      explain: 'HDFS spreads big files over many ordinary machines, keeps copies for safety, and uses a central map. It was designed to avoid needing expensive hardware.' },

    { type: 'scenario', title: 'Do you really need a cluster?', intro: 'A friend asks you to help choose a tool. Their company produces 50 GB of logs a month, and the analyst wants a weekly "top pages" report. Someone has suggested building a Hadoop cluster.',
      meters: { 'cost': 70, 'simplicity': 70, 'speed to answer': 30 },
      steps: [
        { text: 'First question to ask?',
          choices: [
            { label: 'How big is the data, and how fast does it grow?', score: 2, effects: { 'simplicity': 10, 'speed to answer': 10 }, feedback: '50 GB a month is small by big data standards: one machine, or a managed warehouse, can handle it. Knowing the size comes before choosing the tool.' },
            { label: 'Which Hadoop distribution is fashionable?', score: 0, effects: { 'cost': -15 }, feedback: 'Choosing the tool before sizing the problem is how teams end up running clusters they do not need.' },
            { label: 'How many machines can we afford?', score: 1, effects: { 'cost': -5 }, feedback: 'Cost matters, but it follows from the size and shape of the data.' }
          ] },
        { text: 'With 50 GB a month and a weekly report, what is the sensible design?',
          choices: [
            { label: 'Load it into a managed warehouse (or even one big machine) and write SQL', score: 2, effects: { 'cost': 10, 'simplicity': 15, 'speed to answer': 35 }, feedback: 'No cluster to run, no code to write beyond SQL. MapReduce thinking is only worth it when one machine truly cannot cope.' },
            { label: 'Build a ten-node Hadoop cluster and write MapReduce jobs', score: 0, effects: { 'cost': -40, 'simplicity': -40, 'speed to answer': -10 }, feedback: 'Months of work and an ongoing operations burden, for data that fits on a laptop.' },
            { label: 'Use a spreadsheet', score: 1, effects: { 'speed to answer': 10, 'simplicity': 5 }, feedback: 'Fifty gigabytes is too large for a spreadsheet, though the instinct to keep it simple is right.' }
          ] },
        { text: 'Two years later the logs are 200 TB and growing. Now what?',
          choices: [
            { label: 'Time to use distributed processing (Spark or a cloud warehouse) over distributed storage', score: 2, effects: { 'speed to answer': 20, 'cost': -10 }, feedback: 'Now one machine truly cannot cope, and splitting work across many is the right answer. Today that usually means Spark or a cloud warehouse rather than raw MapReduce.' },
            { label: 'Buy the biggest server and hope', score: 1, effects: { 'cost': -30, 'speed to answer': 5 }, feedback: 'There is a ceiling, and reading 200 TB through one machine takes days.' },
            { label: 'Delete old logs', score: 0, effects: { 'speed to answer': -10 }, feedback: 'You would lose the history that makes the trends visible.' }
          ] }
      ],
      outro: 'Distributed processing is for data that **genuinely does not fit** on one machine. Size the problem first.' },

    { type: 'short', q: 'Which stage sits between map and reduce, grouping pairs by key across the network? (one word)', accept: ['shuffle', 'shuffling', 'the shuffle', 'shuffle stage'], hint: 'Like a deck of cards.',
      explain: 'The **shuffle** moves each key’s pairs to the right reducer. It is the costliest stage, because it sends data over the network.' }
  ],

  flashcards: [
    { q: 'What do map, shuffle and reduce each do?', a: 'Map processes each record into key-value pairs where the data lives. Shuffle groups pairs by key across the network. Reduce combines each key’s values into a result.' },
    { q: 'What is HDFS?', a: 'Hadoop’s distributed file system: files split into large blocks, each copied to several machines, with a name node tracking locations.' },
    { q: 'What is data locality?', a: 'Sending the code to the machines that hold the data, rather than moving huge data to the code.' },
    { q: 'Why did plain MapReduce lose ground?', a: 'It writes to disk between every stage, is verbose and is slow for iterative or interactive work. In-memory engines like Spark replaced it for most new work.' },
    { q: 'Where does Hadoop fit today?', a: 'HDFS, YARN and Hive run in many older systems, and Spark often runs on top of it; newer projects tend to use cloud storage with Spark or a cloud warehouse.' }
  ],

  glossary: [
    { term: 'MapReduce', def: 'A programming model for processing huge datasets in parallel: a map step, a shuffle that groups by key, and a reduce step.', like: 'Counting votes: polling stations tally, regional offices collate, then add up.' },
    { term: 'Shuffle', def: 'The stage between map and reduce that groups key-value pairs by key and sends each group to one reducer, across the network.' },
    { term: 'HDFS', def: 'The Hadoop Distributed File System: stores big files as replicated blocks across many machines.', like: 'An encyclopedia split into volumes with spare copies in different libraries.' },
    { term: 'Hadoop', def: 'An open-source framework for storing (HDFS) and processing (MapReduce, YARN) huge datasets on clusters of ordinary machines.' },
    { term: 'Data locality', def: 'Running a computation on the machine that already holds the data, instead of moving the data to the computation.' }
  ],

  takeaways: [
    'One machine cannot read terabytes quickly; **split the data and the work** across many.',
    '**Map** (where the data is) → **shuffle** (group by key) → **reduce** (combine). The shuffle is the costly step.',
    '**HDFS** splits files into replicated blocks; Hadoop **moves code to data**.',
    'MapReduce is slow on disk and verbose; the idea lives on in Spark, and Hadoop is mostly legacy today.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-spark', {
  eli5: 'Spark does the same split-the-work trick as MapReduce but keeps data in memory between steps and plans the whole job before starting, so it is far quicker and much nicer to write.',

  cards: [
    { kind: 'concept', title: 'Ten steps, ten trips to the disk',
      body: `An analyst wants to clean a huge dataset, filter it, join it to another, group it, and then try three different calculations. That is a **chain of steps**, each feeding the next.

        With classic MapReduce, every step **writes its result to disk**, and the next step reads it back. Disks (even many of them) are far slower than memory. A ten-step chain pays for ten disk round trips, and the more steps, the worse it gets. Machine-learning algorithms, which loop over the same data again and again, suffered most.

        **Apache Spark** was built around one idea: *keep the data in memory between steps.* Same cluster, same split-the-work thinking, a very different speed.` },

    { kind: 'metaphor', title: 'The whiteboard versus the filing cabinet',
      body: `Imagine solving a long maths problem. You can work on a **whiteboard**: write a number, glance at it, use it in the next line, rub it out when finished. Or you can walk to a **filing cabinet** after every step, file the result, and fetch it again to continue.

        Both reach the answer. The whiteboard is much faster, because everything you need is right in front of you.

        MapReduce is the filing cabinet: safe, because everything is stored, but slow. Spark is the whiteboard. It keeps intermediate results in memory across the machines of a cluster.

        Where the metaphor stops: a whiteboard can be wiped by accident. Spark remembers *how* it made each result, so it can recreate anything that vanishes.` },

    { kind: 'concept', title: 'RDDs and DataFrames',
      body: `Spark's original building block is the **RDD**, a *resilient distributed dataset*: a collection of records split into **partitions** spread over the cluster's machines.

        - **Distributed:** the pieces live on different machines and are processed in parallel.
        - **Immutable:** you never edit an RDD. Every step creates a new one.
        - **Resilient:** each RDD remembers its recipe (its **lineage**), so if a machine dies, only its lost pieces are recomputed.

        Most people today use the friendlier **DataFrame**: a distributed table with named columns, like a SQL table or a spreadsheet. Because Spark knows the columns and types, it can **optimise** your query automatically. RDDs are still there underneath, but day to day you write DataFrame code (or plain SQL).` },

    { kind: 'code', title: 'A Spark job in four lines',
      body: 'This is PySpark, Spark from Python. It should look reassuring after a page of MapReduce. Tap the lines.',
      code: { lang: 'py', src: `
        orders = spark.read.parquet("/data/orders")
        big = orders.filter(orders.total > 100)
        by_country = big.groupBy("country").sum("total")
        by_country.show()`,
        notes: {
          1: 'Describes the data to read. **Nothing is read yet.**',
          2: 'Keep orders over 100. Again, just a **plan** so far: Spark has not touched the data.',
          3: 'Group by country and add up totals. Spark notes this needs a **shuffle**, as in MapReduce, but it is still only a plan.',
          4: '`show()` is an **action**: it demands a result. Only now does Spark optimise the whole plan and run it across the cluster.'
        } },
      note: 'Parquet is a columnar file format, the file-level cousin of the column stores from the first lesson.' },

    { kind: 'concept', title: 'Lazy evaluation: plan first, work later',
      body: `Look back at that code. Lines 1 to 3 did *nothing*. They just wrote a plan. That is **lazy evaluation**.

        Spark splits its operations into two kinds:

        - **Transformations** build up the plan: \`filter\`, \`select\`, \`groupBy\`, \`join\`. Lazy.
        - **Actions** demand an answer: \`count\`, \`show\`, \`collect\`, \`write\`. They trigger the run.

        Why wait? Because with the whole plan in view, Spark can be clever: skip columns nobody uses, push the filter as early as possible so less data moves, and merge steps. A chef who reads the **whole** recipe first does a better job than one who reads one line at a time.` },

    { kind: 'diagram', title: 'From your code to a DAG',
      body: 'Spark turns the plan into a **DAG**, a directed acyclic graph: boxes (steps) with one-way arrows and no loops. It then splits the DAG into stages at each shuffle.',
      nodes: [
        { id: 'read', label: 'Read orders', icon: '📥', x: 1, y: 0 },
        { id: 'filt', label: 'Filter total > 100', x: 1, y: 1, tone: 'info' },
        { id: 'grp', label: 'Group by country (shuffle)', x: 1, y: 2, tone: 'warn' },
        { id: 'sum', label: 'Sum totals', x: 1, y: 3, tone: 'info' },
        { id: 'show', label: 'Action: show()', icon: '▶️', x: 1, y: 4, tone: 'accent' }
      ],
      edges: [
        { from: 'read', to: 'filt' },
        { from: 'filt', to: 'grp' },
        { from: 'grp', to: 'sum' },
        { from: 'sum', to: 'show' }
      ],
      caption: 'Read, filter and (the map side of) group run together in memory without any network traffic. Only the group-by forces data to move.' },

    { kind: 'concept', title: 'One engine, many jobs',
      body: `Before Spark, each kind of data job needed its own tool: one for batch, another for SQL, another for streaming, another for machine learning. Spark offers **libraries on one engine**:

        - **Spark SQL / DataFrames:** query structured data with SQL.
        - **Structured Streaming:** process live streams with the same code as batch.
        - **MLlib:** machine learning at scale: regression, clustering and so on.
        - **GraphX:** analyse graphs, such as social networks.

        One cluster, one set of skills, and data passes between them without being exported and re-imported. You can clean data with SQL, train a model on it, and score a live stream, all in one program.` },

    { kind: 'pitfall', title: 'Spark is not magic',
      body: `Spark makes big data jobs easier, but it does not repeal physics:

        - **Shuffles are still costly.** A badly chosen \`groupBy\` or \`join\` moves enormous amounts of data across the network.
        - **\`collect()\` can crash your program.** It pulls **all** the results back to one machine (the *driver*). Collect a billion rows and the driver runs out of memory.
        - **Memory is finite.** Datasets bigger than memory spill to disk, and the job slows down.
        - **Small data does not need it.** If your data fits on one machine, a plain script or a database is simpler and often faster. Spark has a start-up cost.` },

    { kind: 'realworld', title: 'Where you will meet Spark',
      body: `Spark is one of the most widely used engines for large-scale data work. It runs on Hadoop clusters, on Kubernetes, and as a managed service in the major clouds. Platforms such as Databricks (founded by Spark's original creators) are built around it.

        Typical uses: nightly batch pipelines that transform terabytes (the **T** in ELT), preparing data for machine learning, and streaming jobs.

        You do not need to run Spark yourself to benefit. Many warehouses and lakehouses use similar ideas under the hood: distribute the data, plan the query, keep intermediate results in memory.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'Spark is faster than classic MapReduce mainly because it keeps intermediate results in memory instead of writing them to disk after every step.', answer: true,
      explain: 'Disk round trips between stages were MapReduce’s main cost. Keeping data in memory, especially across many chained or repeated steps, is Spark’s core advantage.' },

    { type: 'bucket', after: 4, prompt: 'Is each Spark operation a transformation (lazy) or an action (runs the job)?', buckets: ['Transformation (lazy)', 'Action (runs the job)'],
      items: [['filter(orders.total > 100)', 0], ['count()', 1], ['groupBy("country")', 0], ['show()', 1], ['join(customers, "id")', 0], ['write.parquet("/out")', 1], ['select("name", "total")', 0]],
      explain: 'Transformations only describe the plan. Actions ask for a result, so Spark finally optimises and runs the whole DAG.' },

    { type: 'mcq', q: 'You write `orders.filter(...)` and `.groupBy(...)` in Spark but never call an action. What happens?',
      options: ['Nothing runs: Spark has only built a plan', 'The data is read and shuffled immediately', 'Spark raises an error for missing output', 'The filter runs but the grouping does not'],
      answer: 0,
      why: [null, 'That would be eager execution, which is not how Spark works.', 'Building a plan without running it is perfectly valid.', 'Neither step runs without an action.'],
      explain: 'Transformations are lazy. Spark records them and waits for an action before reading any data, so it can optimise the entire plan at once.' },

    { type: 'match', prompt: 'Match each Spark term to what it means.',
      pairs: [['RDD', 'Immutable collection split across machines'], ['DataFrame', 'Distributed table with named columns'], ['Lineage', 'The recipe used to rebuild lost pieces'], ['DAG', 'Plan of steps with one-way arrows'], ['Lazy evaluation', 'Plan first; run only when an action asks']],
      explain: 'RDDs and DataFrames are the data structures; lineage makes them resilient; the DAG and lazy evaluation are how Spark plans and then runs the work.' },

    { type: 'order', prompt: 'Put what Spark does with your code in order.',
      items: ['You write transformations; Spark records the plan', 'You call an action such as show()', 'Spark optimises the plan and builds a DAG', 'The DAG is split into stages at each shuffle', 'Executors on the cluster run the tasks and return the result'],
      explain: 'Nothing happens until the action. Then the optimiser works on the whole plan, and the work is carried out in stages.' },

    { type: 'spot', prompt: 'This job crashes with an out-of-memory error on the driver. Tap the problem line.',
      code: { lang: 'py', src: `
        events = spark.read.parquet("/data/events")
        recent = events.filter(events.day == "2025-03-01")
        rows = recent.collect()
        for r in rows:
            handle(r)` },
      lines: [3],
      explain: '`collect()` pulls every matching row back into one machine’s memory. With millions of events the driver runs out. Write results to storage, aggregate first, or process the rows on the cluster.' },

    { type: 'ab', q: 'You need the number of orders per country from a billion rows. Which approach is better?',
      a: { lang: 'py', label: 'Aggregate on the cluster', src: `
        counts = orders.groupBy("country").count()
        counts.show()` },
      b: { lang: 'py', label: 'Collect, then count in Python', src: `
        rows = orders.collect()
        counts = {}
        for r in rows:
            counts[r.country] = counts.get(r.country, 0) + 1` },
      answer: 'a',
      explain: 'The first lets the cluster do the heavy work in parallel and returns only a few rows. The second drags a billion rows to one machine, which is slow and likely to crash.' },

    { type: 'cloze', text: 'Spark keeps data in {{memory}} between steps. Operations such as filter only build a plan until an {{action}} is called, which is called {{lazy}} evaluation. Spark libraries include {{MLlib}} for machine learning.',
      distractors: ['disk', 'index', 'shuffle'],
      explain: 'Memory, lazy plans and actions, and a family of libraries on one engine are the three things that distinguish Spark.' },

    { type: 'scenario', title: 'The slow nightly job', intro: 'A nightly Spark job at a retailer used to take 40 minutes and now takes 5 hours. Dashboards are late every morning. You are asked to find out why and fix it.',
      meters: { 'job speed': 20, 'cost': 60, 'risk': 30 },
      steps: [
        { text: 'Where do you start looking?',
          choices: [
            { label: 'The Spark UI: look at the stages and find where the time and shuffled data are going', score: 2, effects: { 'job speed': 10 }, feedback: 'The UI shows each stage’s duration and how much data it shuffled. One stage is shuffling most of the data, a join whose key is skewed.' },
            { label: 'Triple the cluster size straight away', score: 1, effects: { 'job speed': 10, 'cost': -30 }, feedback: 'It may help a bit, but if one stage is bottlenecked on a skewed key, more machines mostly sit idle while you pay for them.' },
            { label: 'Rewrite the whole job in plain Python', score: 0, effects: { 'risk': 25, 'cost': -10 }, feedback: 'You would be rewriting something that works, for data that does not fit on one machine.' }
          ] },
        { text: 'The slow stage is a join on `customer_id`. One enormous customer account makes one task take hours. What is the sensible fix?',
          choices: [
            { label: 'Reduce the data before the join: filter and select columns early; handle the huge key separately', score: 2, effects: { 'job speed': 45, 'risk': 5 }, feedback: 'Less data in the shuffle, and the skewed key no longer holds up the whole stage. This is the standard cure for skew.' },
            { label: 'Call collect() so everything is on one machine', score: 0, effects: { 'job speed': -20, 'risk': 30 }, feedback: 'That moves the whole dataset onto the driver, which will crash.' },
            { label: 'Cache everything in memory', score: 1, effects: { 'job speed': 5, 'cost': -10 }, feedback: 'Caching helps when data is reused repeatedly. It does not fix a lopsided shuffle.' }
          ] },
        { text: 'The job is fast again. How do you stop it regressing quietly?',
          choices: [
            { label: 'Track job duration and shuffled data over time, and alert when they jump', score: 2, effects: { 'risk': -20 }, feedback: 'The next slowdown is spotted in days, not months, and you have the history to compare against.' },
            { label: 'Do nothing; it is fixed now', score: 0, effects: { 'risk': 15 }, feedback: 'Data grows and skews change. Without monitoring, the same problem returns and nobody notices until the dashboard is late.' },
            { label: 'Run it more often, in case it fails', score: 0, effects: { 'cost': -15 }, feedback: 'More runs cost more and do not catch gradual slowdowns.' }
          ] }
      ],
      outro: 'Spark jobs are usually slow because of **shuffles and skew**, not because Spark is slow. Look at the stages first.' },

    { type: 'explain', prompt: 'In your own words: why is Spark usually faster than MapReduce, and what does "lazy evaluation" buy you?',
      model: 'MapReduce writes results to disk after each step, while Spark keeps intermediate data in memory across the cluster, which matters most for chained or repeated steps. Spark is also lazy: transformations only build a plan, and nothing runs until an action. Seeing the whole plan lets Spark optimise it, for example by filtering early and skipping unused columns, so less data is read and shuffled.',
      keywords: ['memory', 'disk', 'plan', 'action', 'lazy', 'optimise', 'DAG', 'shuffle'] }
  ],

  flashcards: [
    { q: 'Why is Spark generally faster than MapReduce?', a: 'It keeps intermediate results in memory instead of writing them to disk after every step, and it optimises the whole plan before running.' },
    { q: 'RDD vs DataFrame?', a: 'An RDD is an immutable distributed collection of records. A DataFrame is a distributed table with named columns, which Spark can optimise. Most people use DataFrames.' },
    { q: 'Transformations vs actions?', a: 'Transformations (filter, select, groupBy, join) build a lazy plan. Actions (count, show, collect, write) trigger the actual run.' },
    { q: 'What is a DAG in Spark?', a: 'A directed acyclic graph of steps: Spark plans the job as one, then splits it into stages at each shuffle.' },
    { q: 'Which things does Spark bundle on one engine?', a: 'Spark SQL/DataFrames, Structured Streaming, MLlib for machine learning, and GraphX for graphs.' }
  ],

  glossary: [
    { term: 'Apache Spark', def: 'An open-source engine for processing large datasets across a cluster, keeping data in memory between steps.', like: 'The whiteboard compared with MapReduce’s filing cabinet.' },
    { term: 'RDD', def: 'Resilient Distributed Dataset: Spark’s basic immutable collection of records spread across machines, able to rebuild lost pieces from its lineage.' },
    { term: 'DataFrame', def: 'A distributed table with named, typed columns that Spark can optimise, used with code or SQL.' },
    { term: 'Lazy evaluation', def: 'Delaying work until a result is actually requested, so the whole plan can be optimised first.', like: 'Reading the whole recipe before touching the ingredients.' },
    { term: 'DAG', def: 'Directed acyclic graph: steps joined by one-way arrows with no loops. Spark turns your plan into one before running it.', aka: ['directed acyclic graph'] }
  ],

  takeaways: [
    'Spark keeps data **in memory between steps**, avoiding MapReduce’s disk round trips.',
    '**DataFrames** are distributed tables; **transformations are lazy**, **actions** trigger the run.',
    'Spark plans the whole job as a **DAG**, optimises it, and splits it into stages at each shuffle.',
    'One engine for **SQL, streaming, ML and graphs**; beware shuffles, skew and `collect()`.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('bd-streaming', {
  eli5: 'Batch processing waits until the data has piled up and then analyses it all. Stream processing analyses each event as it arrives, in small time windows, so answers come in seconds instead of tomorrow.',

  cards: [
    { kind: 'concept', title: 'Fraud found tomorrow is fraud paid today',
      body: `A thief steals a card and buys things all afternoon. The bank's nightly batch job runs at 2am, notices the odd pattern, and raises an alert... at breakfast. The money has already gone.

        What the bank wants is a system that notices **the third suspicious purchase within five minutes**, while the thief is still at the till.

        That is **stream processing**: analysing events **as they happen**, continuously, rather than waiting for a pile of data to collect. Everything before this lesson (warehouses, ETL, MapReduce, Spark jobs) was mostly **batch**: run on a chunk, produce an answer, stop. Now we leave the tap running.` },

    { kind: 'metaphor', title: 'The lake and the river',
      body: `**Batch** processing is like testing a lake. You collect a bucket of water, take it to the lab, and report on that bucket. It is thorough, and the answer describes the water as it was when you scooped.

        **Stream** processing is like a sensor in a river. Water flows past continuously, and the sensor reports as it goes: "the pH just dropped". You never see the whole river, only what is passing the sensor now, and you must decide quickly.

        Both are useful. The river never ends, so you cannot say "wait until all the data has arrived". There is no "all".` },

    { kind: 'compare', title: 'Batch versus stream',
      body: 'The difference is not just speed; it changes how you think about the data.',
      cols: ['Batch', 'Stream'],
      rows: [
        ['Data is', 'A finite pile, complete', 'An endless flow of events'],
        ['Runs', 'On a schedule, then stops', 'Continuously'],
        ['Answers arrive', 'Minutes to hours later', 'Seconds or less'],
        ['Late data', 'Just wait for it', 'A real problem to handle'],
        ['Typical use', 'Reports, ML training, history', 'Fraud, alerts, live dashboards']
      ] },

    { kind: 'concept', title: 'Events, and two kinds of time',
      body: `The unit of a stream is the **event**: a small record that says something happened (a click, a card payment, a sensor reading), with a **timestamp**.

        There are two different clocks to worry about:

        - **Event time:** when the thing actually happened (the card was swiped at 10:04).
        - **Processing time:** when your system got to see it.

        These differ more than you might think. A phone in a tunnel sends its 10:04 click at 10:09. Events arrive **late** and **out of order**. If you group by processing time, a delayed click lands in the wrong minute. Good stream processors group by **event time**, which is how the world really was.` },

    { kind: 'concept', title: 'Windows: slicing an endless stream',
      body: `You cannot "count all clicks" on a stream that never ends. So you cut it into **windows** and compute one answer per window.

        - **Tumbling window:** fixed, non-overlapping slices: 10:00–10:05, 10:05–10:10. Every event belongs to exactly one. ("Clicks per 5 minutes.")
        - **Sliding (hopping) window:** fixed length but overlapping, moving forward by a smaller step: each 5-minute window starts a minute after the last. ("Average over the last 5 minutes, updated every minute.")
        - **Session window:** grouped by activity, closed after a gap of silence. ("One window per user visit, ending after 30 minutes idle.")

        Pick the window that matches the question you are asking.` },

    { kind: 'sequence', title: 'Late events and the watermark',
      body: 'A window cannot wait forever for stragglers. A **watermark** is the processor’s estimate of "I have probably seen everything up to this time". Step through.',
      actors: ['Phone', 'Processor', 'Dashboard'],
      steps: [
        { from: 0, to: 1, label: 'click, event time 10:03', note: 'It arrives promptly and is counted in the window **10:00–10:05**.' },
        { note: 'A second click, event time 10:04, is delayed: the phone is in a tunnel.' },
        { from: 0, to: 1, label: 'click, event time 10:07', note: 'The processor now sees 10:07. With an allowed lateness of 2 minutes, it sets the **watermark** to 10:05 (latest event time minus 2 minutes).' },
        { from: 1, to: 2, label: 'window 10:00–10:05: 1 click', note: 'The watermark has passed the end of the window, so the processor **closes it and emits the answer**.' },
        { from: 0, to: 1, label: 'click, event time 10:04 (late!)', note: 'The tunnel click finally arrives, after its window closed. The processor must choose: drop it, send it to a "late" side output, or update the earlier result.' },
        { note: 'A longer allowed lateness means more accurate answers but a longer wait. **Accuracy against delay** is the central trade-off of streaming.' }
      ] },

    { kind: 'code', title: 'A windowed count, in pseudo-code',
      body: 'Real tools differ in syntax but the shape is the same. Tap the lines.',
      code: { lang: 'js', src: `
        stream("card-payments")
          .filter(p => p.amount > 500)
          .groupBy(p => p.cardId)
          .window(tumbling("5 minutes"), { allowedLateness: "2 minutes" })
          .count()
          .filter(n => n >= 3)
          .to("fraud-alerts");`,
        notes: {
          1: 'Read an unending stream of events from a topic or log.',
          3: 'Keep one running count **per card**. The processor stores this **state** and must survive crashes without losing it.',
          4: 'Cut each card’s events into 5-minute event-time windows, and wait up to 2 minutes for late arrivals before closing a window.',
          6: 'Three or more large purchases inside one window means suspicious.',
          7: 'Send alerts to another topic that a human or system acts on, within seconds.'
        } },
      note: 'Streams and topics come from the Messaging world: Kafka, which you will meet properly there, is the log most streams read from.' },

    { kind: 'compare', title: 'Kafka Streams, Flink and Spark at a glance',
      body: 'Three popular ways to run code like the above. Treat this as a map, not a buyer’s guide.',
      cols: ['Kafka Streams', 'Apache Flink', 'Spark Streaming'],
      rows: [
        ['What it is', 'A library inside your app', 'A cluster engine for streams', 'Spark’s streaming mode'],
        ['Runs on', 'Your own app instances', 'Its own cluster', 'A Spark cluster'],
        ['Input', 'Kafka topics', 'Kafka and many others', 'Kafka, files and more'],
        ['Model', 'Event at a time', 'Event at a time, rich state', 'Small micro-batches by default'],
        ['Strength', 'Simple to deploy', 'Event time, big state', 'Reuse batch skills and code']
      ] },

    { kind: 'concept', title: 'Lambda and kappa: how to combine both',
      body: `Many companies need fast approximate answers **and** exact historical ones. Two famous architectures:

        **Lambda:** run **two** pipelines side by side. A **batch layer** recomputes exact results from all history, slowly. A **speed layer** processes new events instantly. A serving layer merges both. Drawback: you write and maintain the same logic **twice**, and the two can disagree.

        **Kappa:** run only the **stream** pipeline. To fix a bug or change logic, **replay** the stored event log (for example a retained Kafka topic) through the new code. One code path, simpler; but you need a log you can replay, and a stream engine that handles history well.

        Experts disagree about which is better. Kappa is simpler when your tools support it; lambda is still common where batch tools dominate.` },

    { kind: 'pitfall', title: 'Streaming costs more thought than it looks',
      body: `Do not stream just because it sounds modern. Pitfalls:

        - **State.** Counting per user means remembering every user. That state must be stored, backed up, and recovered after failures.
        - **Duplicates and "exactly once".** Events can be delivered twice. Some tools claim *exactly-once processing*; read the small print. Idempotent outputs remain your friend, as in the Scaling Data module.
        - **Late data** needs a policy, not wishful thinking.
        - **Cost.** A system running 24/7 costs more than a nightly job.

        Rule of thumb: ask "what is the business value of an answer in seconds rather than hours?" If the answer is "none", use batch.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A user’s click happened at 10:04 but, because of a bad connection, reaches your system at 10:09. Which time should a fair 5-minute count use?',
      options: ['Event time: 10:04, when it really happened', 'Processing time: 10:09, when it arrived', 'Either; they always match', 'Neither; late events are always discarded'],
      answer: 0,
      why: [null, 'Grouping by arrival puts the click in the wrong window and makes slow networks look like traffic spikes.', 'They differ whenever anything is delayed, and in real systems that is constantly.', 'Some systems drop late events, but that is a policy choice, not a rule.'],
      explain: 'Event time reflects reality. Processing time reflects your pipeline’s delays. Good stream processors use event time and a watermark to decide how long to wait.' },

    { type: 'match', after: 4, prompt: 'Match each window type to its description.',
      pairs: [['Tumbling', 'Fixed, non-overlapping slices'], ['Sliding', 'Fixed length, overlapping, moves in small steps'], ['Session', 'Grouped by activity, closed after a quiet gap'], ['Watermark', 'Estimate of how far event time has safely reached'], ['Event time', 'When something actually happened']],
      explain: 'The three window types cut the stream in different ways. The watermark and event time are what let the processor decide when a window is complete.' },

    { type: 'tf', after: 5, statement: 'A longer allowed lateness in a stream job gives more accurate window results but delays when each result is produced.', answer: true,
      explain: 'Waiting longer catches more stragglers, so results are more complete, but each window closes later. That accuracy against delay trade-off is built into streaming.' },

    { type: 'bucket', prompt: 'Which approach suits each need better?', buckets: ['Batch', 'Stream'],
      items: [['A monthly revenue report for the board', 0], ['Alerting when a card is used abroad minutes after use at home', 1], ['Retraining a recommendation model on a year of history', 0], ['A live dashboard of orders per minute', 1], ['Reconciling the books at day end', 0], ['Detecting a failing server from its log lines right now', 1]],
      explain: 'Ask what an answer in seconds is worth. Where it is worth a lot (fraud, outages, live views) use a stream; where completeness and cost matter more, use batch.' },

    { type: 'order', prompt: 'Put these in order as a 5-minute event-time window is closed.',
      items: ['Events arrive and are assigned to windows by event time', 'The processor tracks the latest event time it has seen', 'The watermark advances to latest time minus allowed lateness', 'The watermark passes the end of a window', 'The window closes and its result is emitted'],
      explain: 'The watermark follows event time, minus a tolerance. When it passes a window’s end, the processor judges the window complete and publishes its answer.' },

    { type: 'spot', prompt: 'A team counts logins per 5-minute window. Tap the line that makes their counts wrong when the network is slow.',
      code: { lang: 'js', src: `
        stream("logins")
          .groupBy(e => e.userId)
          .window(tumbling("5 minutes"), { by: "processingTime" })
          .count()
          .to("login-counts");` },
      lines: [3],
      explain: 'Windowing by processing time puts delayed events in the wrong window, so slow connections look like bursts. Windowing by event time (with a watermark for lateness) reflects when logins really happened.' },

    { type: 'cloze', text: 'In {{lambda}} architecture you run a batch layer and a speed layer, so the logic exists twice. In {{kappa}} you keep a single stream pipeline and {{replay}} the stored event log to reprocess history.',
      distractors: ['shuffle', 'star', 'index'],
      explain: 'Lambda doubles your code; kappa simplifies to one path and relies on a replayable log such as a retained Kafka topic.' },

    { type: 'scenario', title: 'The ride-hailing surge board', intro: 'You are building a live "demand per area" heat map for a ride-hailing app. Ride requests arrive as events from phones, sometimes late, and operations want to see the map update every few seconds.',
      meters: { 'freshness': 30, 'accuracy': 50, 'cost': 70 },
      steps: [
        { text: 'First design choice: how often do you compute demand per area?',
          choices: [
            { label: 'Continuously, as a stream with short windows', score: 2, effects: { 'freshness': 45, 'cost': -15 }, feedback: 'The map needs to change within seconds, which is what streams are for. Sliding windows give a smooth, regularly updated view.' },
            { label: 'A nightly batch job', score: 0, effects: { 'freshness': -10, 'accuracy': 10 }, feedback: 'Accurate, but the map would show yesterday. Surge pricing needs now.' },
            { label: 'Rerun a large query every few seconds on the warehouse', score: 1, effects: { 'freshness': 15, 'cost': -35 }, feedback: 'It sort of works, but it re-reads huge history every time. Streams update incrementally and cost far less.' }
          ] },
        { text: 'Some requests arrive up to a minute late because of poor signal. How do you group them?',
          choices: [
            { label: 'By event time, with a watermark allowing about a minute of lateness', score: 2, effects: { 'accuracy': 35, 'freshness': -5 }, feedback: 'Each request lands in the minute it really happened, and the window waits a little for stragglers. A small, deliberate delay buys accuracy.' },
            { label: 'By processing time; arrival order is good enough', score: 1, effects: { 'accuracy': -15, 'freshness': 10 }, feedback: 'A tunnel then looks like a sudden burst of demand when its backlog arrives. Fast, but misleading.' },
            { label: 'Discard anything that arrives late', score: 0, effects: { 'accuracy': -20 }, feedback: 'You would systematically under-count areas with poor signal, which are exactly the places that need help.' }
          ] },
        { text: 'A bug in the demand formula is found. You need to correct last week’s numbers. What does your architecture allow?',
          choices: [
            { label: 'Fix the code and replay the retained event log through it (kappa-style)', score: 2, effects: { 'accuracy': 25, 'cost': -5 }, feedback: 'One code path, and the log holds the history, so reprocessing is the same job pointed at older data.' },
            { label: 'Rewrite the same logic in a separate batch job and compare', score: 1, effects: { 'accuracy': 15, 'cost': -20 }, feedback: 'This is the lambda way. It works, but you now maintain the logic twice and must keep both in step.' },
            { label: 'Leave last week wrong', score: 0, effects: { 'accuracy': -20 }, feedback: 'Incorrect history quietly poisons every later report.' }
          ] }
      ],
      outro: 'Use a stream where **seconds matter**, group by **event time**, and keep a **replayable log** so you can fix history.' },

    { type: 'explain', prompt: 'In your own words: what is a watermark, and what trade-off does it control?',
      model: 'A watermark is the stream processor’s estimate of how far event time has safely progressed, usually the latest event time seen minus an allowed lateness. When it passes the end of a window, the processor closes the window and emits the result. A longer allowed lateness catches more late events and gives more accurate results, but it delays every answer, so a watermark balances accuracy against delay.',
      keywords: ['watermark', 'event time', 'late', 'window', 'close', 'accuracy', 'delay', 'trade-off'] }
  ],

  flashcards: [
    { q: 'Batch vs stream processing?', a: 'Batch analyses a finite pile of data on a schedule. Stream processing analyses an endless flow of events continuously, giving answers in seconds.' },
    { q: 'Event time vs processing time?', a: 'Event time is when something really happened. Processing time is when your system saw it. Good stream jobs group by event time.' },
    { q: 'Tumbling, sliding and session windows?', a: 'Tumbling: fixed, non-overlapping slices. Sliding: fixed length, overlapping, moving in small steps. Session: grouped by activity and closed after an idle gap.' },
    { q: 'What is a watermark?', a: 'The processor’s estimate that it has seen all events up to a certain event time. When it passes a window’s end, the window closes. It trades accuracy for delay.' },
    { q: 'Lambda vs kappa architecture?', a: 'Lambda runs separate batch and speed layers, so logic is written twice. Kappa uses one stream pipeline and replays the stored event log to reprocess history.' }
  ],

  glossary: [
    { term: 'Stream processing', def: 'Analysing events continuously as they arrive, instead of waiting to process them in batches.', like: 'A sensor in a river rather than a bucket tested in a lab.' },
    { term: 'Event time', def: 'The timestamp of when an event actually happened, as opposed to when the system received it.' },
    { term: 'Window', def: 'A slice of an endless stream (by time or activity) over which one result, such as a count, is computed.', like: 'Reading the river’s pH every five minutes.' },
    { term: 'Watermark', def: 'A moving marker saying "events older than this have probably all arrived". It decides when a window can close.' },
    { term: 'Lambda architecture', def: 'Running a slow exact batch pipeline and a fast streaming pipeline side by side and merging their results.' },
    { term: 'Kappa architecture', def: 'Using only a streaming pipeline, and reprocessing history by replaying the stored event log through it.' }
  ],

  takeaways: [
    '**Stream** processing answers in seconds from an endless flow; **batch** processes a finished pile later.',
    'Group by **event time**, not arrival time; cut the stream into **tumbling, sliding or session windows**.',
    'A **watermark** says when a window can close: wait longer for accuracy, shorter for speed.',
    'Kafka Streams, Flink and Spark Streaming run these jobs; **lambda** keeps two pipelines, **kappa** one replayable one.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('big-data', {
  title: 'The Terabyte Titan',
  intro: 'A giant built from a billion log lines blocks the road to the analytics city. Beat it by choosing the right store, the right pipeline and the right engine for each question.',
  questions: [
    { type: 'mcq', q: 'An analyst runs "total revenue by country for five years" on the live shop database and checkout slows. What is the underlying reason?',
      options: ['A big scan competes with checkouts on a row-store database', 'SQL has no way to compute revenue totals by country', 'The shop database has too few columns for analysis', 'Analysts are not allowed to read production data'],
      answer: 0,
      why: [null, 'SQL handles this easily; the problem is where and how it runs.', 'More columns would make a row store scan worse, not better.', 'Permissions are a separate matter. The trouble is competition for the same machine.'],
      explain: 'OLTP databases are tuned for many small operations. A huge aggregate hogs CPU, memory and disk and pushes useful data out of the cache, so customers feel it.' },

    { type: 'tf', statement: 'A column store reads only the columns a query needs, which is a major reason it suits analytics.', answer: true,
      explain: 'Summing one column of fifty means reading about one fiftieth of the data, and similar values in a column also compress well.' },

    { type: 'bucket', prompt: 'In a retail star schema, is this a fact or a dimension?', buckets: ['Fact', 'Dimension'],
      items: [['One row per sale with quantity and price', 0], ['Product name, brand and category', 1], ['One row per page view', 0], ['Calendar dates with month and quarter', 1], ['Customer city and country', 1], ['One row per refund with its amount', 0]],
      explain: 'Facts are events and the numbers about them. Dimensions describe the who, what, where and when that you group and filter by.' },

    { type: 'match', prompt: 'Match each store to its character.',
      pairs: [['Data warehouse', 'Cleaned tables ready for business reports'], ['Data lake', 'Cheap raw files; structure applied on read'], ['Lakehouse', 'Lake files with warehouse-style tables'], ['Row store', 'Best for fetching or writing whole records'], ['Column store', 'Best for scanning a few columns of many rows']],
      explain: 'Warehouses are curated, lakes are raw and cheap, lakehouses blend them. Row and column stores are the layouts that suit transactions and analytics.' },

    { type: 'order', prompt: 'Put these steps of an ELT pipeline in order.',
      items: ['Extract new data from the source system', 'Load the raw data into the warehouse', 'Transform it with SQL inside the warehouse', 'Run data quality checks on the results', 'Dashboards read the final tables'],
      explain: 'ELT lands raw data first, then transforms in place. Checks come before anyone relies on the output.' },

    { type: 'spot', prompt: 'This nightly job is re-run after crashes. Tap the line that lets duplicates in.',
      code: { lang: 'sql', src: `
        BEGIN;
        INSERT INTO fact_sales
          SELECT * FROM staging_orders
           WHERE sale_date = :day;
        COMMIT;` },
      lines: [2],
      explain: 'A plain INSERT appends every time it runs. Deleting that day’s rows first (or merging by key) in the same transaction would make the job idempotent.' },

    { type: 'estimate', q: 'One disk reads about 100 MB/s. Roughly how long would 100 disks reading in parallel need to read 1 terabyte (1,000,000 MB)?',
      answer: 100, unit: 'seconds', tolerance: 2,
      explain: 'Each disk reads 10,000 MB (1,000,000 ÷ 100) at 100 MB/s, which takes 100 seconds. Splitting the data across many disks is the entire point of distributed processing.' },

    { type: 'cloze', text: 'In MapReduce, {{map}} turns records into key-value pairs, the {{shuffle}} groups them by key across the network, and {{reduce}} combines each key’s values. HDFS lets Hadoop send the {{code}} to where the data lives.',
      distractors: ['index', 'schema', 'window'],
      explain: 'Map and reduce are your functions; shuffle is the framework’s costliest step; data locality means moving the small program to the big data.' },

    { type: 'mcq', q: 'Which is a main reason Spark is usually faster than classic MapReduce for multi-step jobs?',
      options: ['It keeps intermediate data in memory and plans the whole job', 'It avoids the network by running on one big machine', 'It never needs to read the input data at all', 'It stores everything in a row store'],
      answer: 0,
      why: [null, 'Spark is distributed. It still uses many machines and shuffles data when needed.', 'It must read the data; it just reads only what the optimised plan requires.', 'Row versus column layout is not what makes Spark faster here.'],
      explain: 'Skipping the disk between stages, and optimising the whole DAG once an action is called, are Spark’s two big advantages.' },

    { type: 'ab', q: 'You need orders per country from a billion rows. Which is better?',
      a: { lang: 'py', label: 'Let the cluster aggregate', src: `
        orders.groupBy("country").count().show()` },
      b: { lang: 'py', label: 'Collect, then loop', src: `
        rows = orders.collect()
        for r in rows:
            tally(r.country)` },
      answer: 'a',
      explain: 'Aggregating on the cluster returns a handful of rows. Collecting a billion rows into the driver is slow and will probably run out of memory.' },

    { type: 'multi', q: 'Which statements about windows and watermarks are true?',
      options: ['A tumbling window never overlaps the next one', 'Event time is when the event really happened', 'A watermark estimates how far event time has safely progressed', 'Windowing by processing time handles late events perfectly', 'A longer allowed lateness makes results come out sooner'],
      answers: [0, 1, 2],
      explain: 'Processing-time windows misplace delayed events, and a longer allowed lateness makes results come out later, not sooner.' },

    { type: 'short', q: 'Which architecture keeps only a streaming pipeline and reprocesses history by replaying the event log? (one word)', accept: ['kappa', 'kappa architecture'], hint: 'Not lambda.',
      explain: '**Kappa** uses one streaming path and replays the retained log to reprocess history, avoiding the duplicate logic that lambda needs.' }
  ]
});

KS.sheet('big-data', {
  title: 'Big Data & Analytics: cheat sheet',
  sections: [
    { title: 'OLTP vs OLAP',
      md: `| | OLTP | OLAP |
        |---|---|---|
        | Job | Run the business | Understand it |
        | Touches | A few rows by key | Millions of rows, few columns |
        | Storage | Row store | Column store |
        | Example | PostgreSQL app DB | BigQuery, Snowflake |

        Never run big reports on production. Copy data out: **source → pipeline → warehouse/lake → dashboards**. Columnar wins by reading only needed columns and compressing well.` },

    { title: 'Warehouses, lakes, lakehouses',
      md: `**Warehouse:** cleaned, historical, curated tables (schema-on-write). **Lake:** cheap raw files, structure on read (swamp risk). **Lakehouse:** lake files plus a table layer (Delta Lake, Iceberg, Hudi) for transactions and SQL.

        **Star schema:** one **fact** table (events, numbers, keys) ringed by **dimensions** (who, what, where, when).

        Managed warehouses: **Snowflake**, **BigQuery**, **Redshift**.` },

    { title: 'ETL and ELT',
      md: `| | ETL | ELT |
        |---|---|---|
        | Order | Transform, then load | Load raw, then transform |
        | Transform runs | Separate server | Inside the warehouse |
        | Raw kept | Often not | Yes |

        Pipelines are **graphs of tasks** run by an **orchestrator** (Airflow-style): schedules, dependencies, retries, alerts.
        Make jobs **idempotent** (replace or merge, never blind append). Add **quality checks**: counts, nulls, duplicates, freshness.` },

    { title: 'MapReduce and Hadoop',
      md: `**Map** (per record, where the data is) → **shuffle** (group by key, over the network, costly) → **reduce** (combine per key).

        **HDFS:** files in large blocks (often 128 MB), each copied to several machines (often 3), a name node tracks them. **Data locality:** move the code to the data.

        Weakness: disk between every stage, verbose, slow to iterate. Today: legacy and Hive; Spark or cloud warehouses for new work.` },

    { title: 'Apache Spark',
      md: `**In-memory** between steps. **RDD:** immutable distributed collection with lineage. **DataFrame:** distributed table with columns; optimised.

        | Transformations (lazy) | Actions (run it) |
        |---|---|
        | filter, select, groupBy, join | count, show, collect, write |

        Plan becomes a **DAG**, split into stages at each shuffle. Libraries: Spark SQL, Structured Streaming, MLlib, GraphX.
        Watch out: shuffles, data skew, **\`collect()\`** on big data, tiny data (not needed).` },

    { title: 'Stream processing',
      md: `**Batch:** finite pile, scheduled. **Stream:** endless events, continuous, answers in seconds.

        **Event time** (when it happened) vs **processing time** (when you saw it). **Windows:** tumbling (fixed), sliding (overlapping), session (activity gap).
        **Watermark** = latest event time minus allowed lateness; passing a window end closes it. Longer lateness = more accurate, later.

        **Tools:** Kafka Streams (library), Flink (stream engine), Spark Structured Streaming (micro-batch). **Lambda:** batch + speed layers. **Kappa:** one stream pipeline, replay the log.` }
  ]
});
