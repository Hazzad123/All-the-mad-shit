/* Module: scaling-data — Scaling Data.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs scaling-data */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-scaling-intro', {
  eli5: 'When one database gets too busy, you have a ladder of fixes: first make the machine bigger, then add copies, caches and splits. Each rung helps more, and each rung costs you more complexity.',

  cards: [
    { kind: 'concept', title: 'Friday night, and the database is sweating',
      body: `Your little shop app has gone from 50 customers to 50,000. Pages that loaded in a blink now take four seconds. At 8pm on Friday, checkouts start timing out.

        You open the dashboard and see it: the **database** is at 100% CPU. Everything else is bored. Every page, every search and every order asks that one machine a question, and it cannot keep up.

        This module is about what you do next. Not "buy more of everything", but a **ladder of fixes**, ordered from cheap and boring to powerful and painful. Knowing which rung you are on is most of the skill.` },

    { kind: 'concept', title: 'First question: reads or writes?',
      body: `Before fixing anything, ask what kind of work is overwhelming the database.

        - A **read** asks for data without changing it: show the product page, list my orders.
        - A **write** changes data: place an order, update a stock count, post a comment.

        Most apps are **read-heavy**: a product page is viewed thousands of times for every one purchase. A social feed might be 100 reads per write. Some systems flip it: a sensor logger or an analytics collector is **write-heavy**.

        The answer matters because reads are easy to copy and share, while writes must be agreed on by one place. Different problem, different tool.`,
      note: 'Rough habit: measure the read-to-write ratio first. A guess like "mostly reads" is usually right, but the exact ratio picks your fix.' },

    { kind: 'metaphor', title: 'One chef, one kitchen',
      body: `Picture a restaurant with a single brilliant chef. Orders pile up, so what are the options?

        - **Buy a faster stove and sharper knives.** The same chef, just better equipped. (Scale **up**.)
        - **Write the most-asked dishes on a board** so waiters answer "is the soup vegetarian?" without bothering the chef. (A **cache**.)
        - **Hire assistants who copy the chef's recipes** and serve the standard dishes. (**Replicas**.)
        - **Open a second kitchen and split the menu**: starters here, mains there. (**Partitioning**.)

        Notice the order. Each option helps more than the last, and each makes the restaurant harder to run. Two kitchens need a system for "who makes the soup?" that one kitchen never needed.` },

    { kind: 'concept', title: 'Rung one: scale up (it is allowed!)',
      body: `**Scaling up** (also called vertical scaling) means moving to a bigger machine: more CPU cores, more memory, faster disks. You change nothing in your code. Your data is still in one place, so every promise a single database makes (transactions, joins, "what I just wrote is what you read") keeps working.

        It feels unglamorous, and engineers sometimes sneer at it. Don't. A modern single database server can handle far more than most products will ever need, and buying a bigger one is often one afternoon of work versus months of redesign.

        It has a ceiling, though: the biggest machine you can buy is finite, and prices climb steeply near the top. And one machine is still **one machine**: if it dies, you are down.` },

    { kind: 'diagram', title: 'The levers around one database',
      body: 'Here is the toolbox, as a picture. Each lever takes pressure off the busy database in a different way.',
      nodes: [
        { id: 'app', label: 'App servers', icon: '🖥️', x: 1, y: 0 },
        { id: 'cache', label: 'Cache', icon: '⚡', x: 0, y: 1, tone: 'good' },
        { id: 'lead', label: 'Main database', icon: '🗄️', x: 1, y: 1, tone: 'accent' },
        { id: 'rep', label: 'Read replicas', icon: '📚', x: 2, y: 1, tone: 'info' },
        { id: 's1', label: 'Partition A', icon: '🧩', x: 0, y: 3, tone: 'warn' },
        { id: 's2', label: 'Partition B', icon: '🧩', x: 2, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'app', to: 'cache', label: 'ask first' },
        { from: 'app', to: 'lead', label: 'writes' },
        { from: 'app', to: 'rep', label: 'reads', dashed: true },
        { from: 'lead', to: 'rep', label: 'copies', dashed: true },
        { from: 'lead', to: 's1', label: 'split data' },
        { from: 'lead', to: 's2' }
      ],
      caption: 'Cache: remember answers. Replicas: more machines for reads. Partitions: split the data itself so writes spread too.' },

    { kind: 'steps', title: 'The ladder, in the order you climb it',
      body: 'Start at the top and only move down when the measurements say you must.',
      steps: [
        { title: 'Measure and fix the cheap stuff', body: 'Find the slow queries. A missing **index** (a lookup shortcut, covered in *Databases Under the Hood*) can turn a 3-second query into 3 milliseconds. Free speed.' },
        { title: 'Scale up', body: 'Bigger machine, same design. Zero code changes, all guarantees intact.' },
        { title: 'Cache the repeated reads', body: 'Keep popular answers in fast memory so the database never hears the question. Cheap, and it can remove most read load.' },
        { title: 'Add read replicas', body: 'Copies of the database that answer reads. Handles more reads, but writes still go to one place, and copies can be slightly out of date.' },
        { title: 'Partition (shard) the data', body: 'Split the data over several databases so writes spread out too. The most powerful lever, and the most expensive in complexity.' }
      ] },

    { kind: 'pitfall', title: 'The real cost of going distributed',
      body: `Once your data lives on more than one machine, you have a **distributed system**, and a set of problems that a single machine simply does not have:

        - **Machines fail independently.** One can be down while its neighbour is fine.
        - **The network is not instant, and not reliable.** Messages are delayed, duplicated or lost.
        - **Copies disagree.** Two machines can briefly hold different answers to the same question.
        - **Nobody has the whole picture.** There is no "the" time, and no way to ask all machines at once.

        The rest of this module is the toolkit for these problems. Treat it as the **price list** for climbing the ladder, not a shopping list.` },

    { kind: 'compare', title: 'One machine vs many machines',
      body: 'What you give up when the data leaves a single box:',
      cols: ['One database', 'Distributed'],
      rows: [
        ['Transactions', 'Work across all your data', 'Hard across machines (see the last lesson)'],
        ['Joins', 'Join any tables freely', 'Slow or impossible across machines'],
        ['"What I wrote"', 'You read it straight back', 'Maybe, maybe not, yet'],
        ['When it breaks', 'It is down, obviously', 'Partly down, confusingly'],
        ['Debugging', 'One log file', 'Many machines, many clocks']
      ] },

    { kind: 'tip', title: 'Earn each rung',
      body: `Many well-known companies ran on a single, well-tuned relational database for years, often with a cache in front and a replica or two. Distributed data is a tool for **problems you have proved you have**, not for problems you might one day have.

        A good habit: write down the number that is hurting (queries per second, data size, p99 latency) and the rung you think fixes it. If you cannot name the number, you are not ready to climb.`,
      note: 'Experts do argue about how early to prepare for scale. The safe middle: keep your code easy to change, and do not build for 10 million users on day one.' }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'Is this workload read-heavy or write-heavy?', buckets: ['Read-heavy', 'Write-heavy'],
      items: [['A news site: thousands read each article', 0], ['A product catalogue browsed all day', 0], ['A thermostat reporting its temperature every second', 1], ['A logging system storing every click', 1], ['A profile page viewed by many friends', 0], ['A ride app saving a driver’s GPS every few seconds', 1]],
      explain: 'Ask who touches the data more. Content that is published once and viewed many times is read-heavy. Data that is captured continuously and rarely looked at is write-heavy.' },

    { type: 'mcq', after: 3, q: 'Your database is slow, and traffic has doubled. Nothing else is wrong. What is the most sensible first move?',
      options: ['Check slow queries, then try a bigger server before redesigning', 'Split the database into four shards straight away', 'Rewrite the app to use a different kind of database', 'Add a replica and a cache and a shard all at once'],
      answer: 0,
      why: [null, 'Sharding is the most complex rung. Without measuring, it is a very expensive guess.', 'A rewrite is months of work and does not obviously help.', 'Pulling every lever at once means you will not know which one worked, and you pay every cost.'],
      explain: 'Cheap, reversible steps first. A missing index or an undersized server is far more common than a design that truly needs splitting.' },

    { type: 'order', prompt: 'Put these in the order a sensible team would try them.',
      items: ['Find and fix slow queries', 'Move to a bigger database server', 'Put a cache in front for popular reads', 'Add read replicas', 'Shard the data across several databases'],
      explain: 'The order follows cost and complexity: free fixes first, then no-code-change scaling, then extra moving parts, and last the one that changes how your data is organised.' },

    { type: 'tf', after: 6, statement: 'Moving data onto several machines makes everything faster and has no downsides.', answer: false,
      explain: 'More machines can raise capacity, but you pay with harder transactions, harder joins, copies that disagree for a while and partial failures. That cost is the reason to climb the ladder slowly.' },

    { type: 'multi', q: 'Which of these are problems you meet only once your data lives on more than one machine?',
      options: ['One machine is down while another is fine', 'A message between machines is delayed or lost', 'Two copies briefly hold different values', 'A query without an index is slow', 'A bug in your SQL gives a wrong total'],
      answers: [0, 1, 2],
      explain: 'Independent failures, unreliable networks and disagreeing copies are the new distributed problems. Slow queries and buggy SQL happen on a single machine too.' },

    { type: 'estimate', q: 'Your app serves 50 million requests a day, spread fairly evenly. Roughly how many requests per second is that? (A day is about 86,400 seconds, call it 100,000.)',
      answer: 580, unit: 'requests per second', tolerance: 2,
      explain: '50,000,000 ÷ 86,400 is about 580 per second. Real traffic is not even (peaks are often several times the average), but this tells you the order of magnitude: hundreds, not millions. A single well-tuned database can often handle that if it is mostly simple reads.' },

    { type: 'cloze', text: 'A bigger machine is called scaling {{up}}. Remembering popular answers in fast memory is a {{cache}}. Extra copies that serve reads are {{replicas}}, and splitting the data itself across machines is {{partitioning}}.',
      distractors: ['indexing', 'backup', 'encryption'],
      explain: 'These are the four levers in the picture: up, cache, replicas, partitioning. Only the last one spreads writes as well as reads.' },

    { type: 'scenario', title: 'The Friday-night checkout meltdown', intro: 'You run the backend for an online shop. Every Friday evening checkout slows to a crawl. The database CPU is pinned at 95%. You have a budget and a weekend.',
      meters: { 'speed': 30, 'complexity': 10, 'budget': 70 },
      steps: [
        { text: 'First move. You look at the database dashboard.',
          choices: [
            { label: 'Find the heaviest queries and read-vs-write ratio', score: 2, effects: { 'speed': 15, 'complexity': 0 }, feedback: 'Exactly right. You find that 95% of the load is reads, and one product-listing query scans the whole table because an index is missing. Adding the index drops CPU a lot for free.' },
            { label: 'Immediately shard the database by customer', score: 0, effects: { 'complexity': 40, 'budget': -30 }, feedback: 'Three weeks of work, a pile of new failure modes, and you never checked whether a missing index was the culprit. This is the most expensive rung taken first.' },
            { label: 'Buy the biggest server available', score: 1, effects: { 'speed': 20, 'budget': -40 }, feedback: 'It will help, but you spent a lot without understanding the cause. A smaller upgrade after a fix might have been enough.' }
          ] },
        { text: 'The index helps, but Friday peaks still hurt. The load is 95% reads, mostly the same few popular products. What next?',
          choices: [
            { label: 'Cache popular product pages and add a read replica if needed', score: 2, effects: { 'speed': 30, 'complexity': 10, 'budget': -10 }, feedback: 'Reads that repeat are the cheapest to remove. A cache answers most of them without touching the database, and a replica gives you more read capacity later.' },
            { label: 'Shard the orders table so writes spread out', score: 0, effects: { 'complexity': 35, 'budget': -20 }, feedback: 'Writes were not the problem. You added a hard rung to fix something that was never the bottleneck.' },
            { label: 'Do nothing; it only happens on Fridays', score: 0, effects: { 'speed': -15 }, feedback: 'Fridays are when most revenue arrives. Checkouts timing out cost real money.' }
          ] },
        { text: 'A year later, order writes themselves have grown past what one server can handle, even a large one. What now?',
          choices: [
            { label: 'Now it is time to look at partitioning the data', score: 2, effects: { 'speed': 20, 'complexity': 25, 'budget': -15 }, feedback: 'Yes. You have a measured write bottleneck and have used the cheaper rungs. Partitioning is now earned, and the next lessons teach how to do it well.' },
            { label: 'Add another cache', score: 1, effects: { 'speed': 5 }, feedback: 'Caches help reads. Writes still must reach the database, so this barely moves the number that hurts.' },
            { label: 'Add ten more read replicas', score: 0, effects: { 'budget': -20, 'complexity': 10 }, feedback: 'Replicas copy all the data and serve reads. They do nothing for the write load, and each copy has to keep up with every write.' }
          ] }
      ],
      outro: 'The pattern: **measure, take the cheapest fix that targets the actual bottleneck, and only climb when the numbers force you.**' },

    { type: 'explain', prompt: 'A friend says: "Our app is slow, so we should split the database across ten servers." In your own words, what would you ask or suggest first?',
      model: 'I would first find out what is slow and why: is it reads or writes, and is it a few bad queries? Cheap fixes come first: add indexes, use a bigger server, cache repeated reads, add replicas for read-heavy load. Splitting the data across servers is the most complex step, with new problems like failures, disagreeing copies and hard transactions, so I would only do it when measurements show the cheaper options are used up.',
      keywords: ['measure', 'reads', 'writes', 'index', 'bigger server', 'cache', 'replicas', 'complexity'] }
  ],

  flashcards: [
    { q: 'Read-heavy vs write-heavy workload: why does it matter?', a: 'Reads can be copied (caches, replicas); writes must be agreed on in one place. So read-heavy load is easier to scale than write-heavy.' },
    { q: 'What is vertical scaling (scaling up)?', a: 'Moving to a bigger single machine. No code changes, all single-database guarantees stay, but there is a ceiling and one machine is still one point of failure.' },
    { q: 'What is the usual order of the scaling ladder?', a: 'Fix slow queries and indexes, scale up, cache, add read replicas, then partition (shard) the data.' },
    { q: 'What do you give up when data spans several machines?', a: 'Easy transactions and joins, instant agreement between copies, and simple failures: parts of the system can be down or out of date.' }
  ],

  glossary: [
    { term: 'Read-heavy', def: 'A workload where most operations only look at data. Product pages, articles and profiles are classic examples.', like: 'A library: far more people borrow than donate.' },
    { term: 'Write-heavy', def: 'A workload where most operations create or change data, such as logging, metrics or sensor feeds.', like: 'A bank vault’s intake desk during payday.' },
    { term: 'Vertical scaling', def: 'Making one machine bigger (more CPU, memory, disk) instead of adding more machines.', like: 'A faster stove for the same chef.', aka: ['scaling up'] },
    { term: 'Horizontal scaling', def: 'Adding more machines to share the work instead of upgrading one.', like: 'Hiring more chefs.', aka: ['scaling out'] },
    { term: 'Distributed system', def: 'A system whose parts run on several machines connected by a network, and which must keep working when some parts fail or lag.', like: 'A relay team: everyone can drop the baton in their own way.' }
  ],

  takeaways: [
    'First ask: is the load **reads** or **writes**? The answer picks the fix.',
    'Climb the ladder in order: fix queries, **scale up**, **cache**, **replicas**, then **partition**.',
    'Scaling up is allowed, and is often the right answer for longer than you expect.',
    'Every machine you add buys capacity and costs simplicity: **earn each rung** with a measured problem.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-replication', {
  eli5: 'Replication means keeping copies of your data on several machines, so reads can be shared out and a copy can take over if one machine dies. The catch: copies take time to catch up with each other.',

  cards: [
    { kind: 'concept', title: 'Why keep copies at all?',
      body: `Imagine your only database machine catches fire. Not metaphorically: a power supply fails and the machine is gone. Your whole business is offline until someone restores last night's backup, and you have lost a day of orders.

        **Replication** means keeping the same data on several machines, continuously. It gives you three things:

        - **Survival.** If one machine dies, another already has the data.
        - **Read capacity.** Several machines can answer reads at once.
        - **Closeness.** A copy near your users in another country answers faster.

        The hard part is not copying data once. It is keeping every copy up to date while the data keeps changing.` },

    { kind: 'metaphor', title: 'The head chef and the recipe photocopies',
      body: `A restaurant has one head chef, who is the only person allowed to change a recipe. Whenever she does, an assistant photocopies the new page and hands it to the other kitchens.

        Customers can ask any kitchen "what is in the soup?" (a read). But to **change** the soup (a write) you must go to the head chef.

        The photocopies take a little while to reach the other kitchens. For a few minutes, one kitchen may serve the old recipe while another serves the new one.

        That is **leader-follower replication**, and that delay is the source of nearly every interesting problem in this lesson.` },

    { kind: 'concept', title: 'Leader and followers',
      body: `The most common setup is **leader–follower** (older names: master–slave, or primary–replica).

        - One machine is the **leader**. **All writes go to it.**
        - The other machines are **followers**. They receive a stream of every change the leader makes and apply them in the same order.
        - **Reads** can go to the leader or to any follower.

        Because only one machine accepts writes, there is no argument about what order things happened in: the leader decides. That is why PostgreSQL, MySQL, MongoDB and many others use this design by default.

        Writes still bottleneck on one machine. Replication helps reads, not write volume.` },

    { kind: 'diagram', title: 'Writes in, copies out',
      body: 'Trace the arrows: writes funnel into one place, and changes ripple out.',
      nodes: [
        { id: 'app', label: 'App server', icon: '🖥️', x: 1, y: 0 },
        { id: 'l', label: 'Leader', icon: '👑', x: 1, y: 1, tone: 'accent' },
        { id: 'f1', label: 'Follower 1', icon: '🗄️', x: 0, y: 2, tone: 'info' },
        { id: 'f2', label: 'Follower 2', icon: '🗄️', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'app', to: 'l', label: 'all writes' },
        { from: 'l', to: 'f1', label: 'change log', dashed: true },
        { from: 'l', to: 'f2', label: 'change log', dashed: true },
        { from: 'app', to: 'f1', label: 'reads', dashed: true },
        { from: 'app', to: 'f2', dashed: true }
      ],
      caption: 'The leader keeps a log of changes, in order. Followers replay that log.' },

    { kind: 'sequence', title: 'Synchronous vs asynchronous: when does "saved" mean saved?',
      body: 'The leader can confirm a write to you either before or after the follower has it. Step through the two choices.',
      actors: ['App', 'Leader', 'Follower'],
      steps: [
        { from: 0, to: 1, label: 'write: balance = 80', note: 'Your app asks the leader to save a new balance.' },
        { at: 1, label: 'save on the leader', note: 'The leader writes the change to its own disk.' },
        { from: 1, to: 2, label: 'send the change', dashed: true, note: 'The leader forwards the change to the follower.' },
        { from: 1, to: 0, label: 'OK (asynchronous)', note: '**Asynchronous:** the leader replies straight away, without waiting. Fast. But if the leader dies this instant, the follower may never get the change.' },
        { from: 2, to: 1, label: 'got it', dashed: true, note: 'Some time later the follower confirms. Until then, followers lag behind.' },
        { from: 1, to: 0, label: 'OK (synchronous)', note: '**Synchronous:** the leader waits for this confirmation before replying. The copy is safe, but every write is now as slow as the slowest follower, and a dead follower can block writes.' }
      ] },

    { kind: 'compare', title: 'Sync, async, or a bit of both',
      body: 'Neither is "correct". It is a trade between safety and speed.',
      cols: ['Synchronous', 'Asynchronous'],
      rows: [
        ['Write is confirmed', 'After follower has it', 'Straight away'],
        ['Speed of writes', 'Slower, depends on follower', 'Fast'],
        ['If leader dies', 'No acknowledged write is lost', 'Recent writes can be lost'],
        ['If a follower dies', 'Writes may stall', 'Nothing noticeable'],
        ['Common choice', 'Rare, for one follower', 'The usual default']
      ],
      note: 'A popular middle path is **semi-synchronous**: wait for one follower, let the rest be asynchronous. At least two machines always hold every confirmed write.' },

    { kind: 'story', title: 'The disappearing comment',
      body: `You post a comment on a friend's photo. The page reloads and... your comment is gone. You post it again. Now it appears twice.

        What happened: your **write** went to the leader. The reload sent your **read** to a follower that had not yet received the change. This is **replication lag**: the gap between a change reaching the leader and reaching a follower. Usually milliseconds; under heavy load or a network hiccup, seconds or more.

        What you saw is a **stale read**: valid, old data. A common fix is **read-your-writes**: after you write something, your own reads go to the leader for a short while (or to a follower known to be caught up), so you always see your own changes.`,
      note: 'The lab that follows lets you write to a leader, read from lagging followers and see exactly this.' },

    { kind: 'sequence', title: 'Failover, and the danger of two kings',
      body: 'When the leader dies, a follower must be promoted. Watch for what can go wrong.',
      actors: ['Monitor', 'Old leader', 'Follower'],
      steps: [
        { from: 0, to: 1, label: 'are you alive?', note: 'A monitor (or the followers themselves) keeps checking the leader.' },
        { from: 1, to: 0, label: '(no answer)', dashed: true, note: 'Silence. But it could be a crash or merely a **network problem**. They look identical from outside.' },
        { from: 0, to: 2, label: 'you are the leader now', note: 'After a timeout, the follower is promoted. This is **failover**. Any writes the old leader had not yet copied are lost.' },
        { at: 1, label: 'comes back to life', note: 'The old leader was only cut off. It wakes up still believing it is in charge.' },
        { note: '**Split brain:** two machines both accept writes and the data diverges. Real systems prevent this with a majority vote and by forcing the old leader to step down (called *fencing*).' }
      ] },

    { kind: 'deep', title: 'No single leader: multi-leader and leaderless',
      body: `Two other designs avoid the "everything through one machine" limit.

        - **Multi-leader:** several machines accept writes, often one per data centre, and send changes to each other. Fast local writes, but two leaders can change the same record at once, so you need a **conflict-resolution** rule. (Lesson 5 covers those.)
        - **Leaderless:** any node accepts writes. The client sends each write to several nodes and reads from several, trusting the overlap. Amazon's Dynamo paper made this famous; Cassandra works this way. (The quorum rules are in lesson 5.)

        Both trade simplicity for availability across locations. Start with a single leader unless you have a clear reason.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In leader–follower replication, where should a request that **changes** data go?',
      options: ['To the leader, which orders and forwards it', 'To any follower, chosen at random', 'To every machine at once, by the client', 'To the follower with the oldest data'],
      answer: 0,
      why: [null, 'Followers only replay the leader’s log. Writing to one would make it disagree with the others.', 'Clients sending to everyone would let machines see changes in different orders.', 'Age of data has nothing to do with it.'],
      explain: 'With a single leader there is one authority on the order of writes. Followers just replay its log, which is why they can safely serve reads.' },

    { type: 'tf', after: 4, statement: 'With asynchronous replication, a write the leader has confirmed to you can still be lost if the leader crashes immediately afterwards.', answer: true,
      explain: 'Async means the leader answered before the follower had the change. If the leader dies in that gap and a follower takes over, the confirmed write never arrived there.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Replication lag', 'Followers are behind the leader'], ['Stale read', 'You read old data from a copy'], ['Failover', 'Promoting a follower after the leader dies'], ['Split brain', 'Two machines both think they are leader'], ['Read-your-writes', 'You always see your own changes']],
      explain: 'Lag is the cause; stale reads are the symptom; read-your-writes is a promise that hides the symptom from the person who just wrote.' },

    { type: 'ab', q: 'A user changes their display name, then the page reloads. Which read routing avoids showing them the old name?',
      a: { lang: 'js', label: 'Sticky to leader', src: `
        async function loadProfile(userId, session) {
          const recentlyWrote = Date.now() - session.lastWriteAt < 5000;
          const db = recentlyWrote ? leader : pickFollower();
          return db.query('SELECT * FROM users WHERE id = ?', [userId]);
        }` },
      b: { lang: 'js', label: 'Always a follower', src: `
        async function loadProfile(userId, session) {
          const db = pickFollower();
          return db.query('SELECT * FROM users WHERE id = ?', [userId]);
        }` },
      answer: 'a',
      explain: 'Reading from the leader for a few seconds after the user’s own write guarantees they see their change, while everyone else still gets the cheap follower reads. Always using a follower risks a stale read.' },

    { type: 'order', prompt: 'Put a failover in order.',
      items: ['The leader stops answering health checks', 'After a timeout, the machines agree the leader is dead', 'One follower is chosen and promoted to leader', 'Clients are pointed at the new leader', 'The old leader returns and is demoted to follower'],
      explain: 'You must be reasonably sure the leader is gone before promoting, and the old leader must be stopped from acting as leader if it returns, or you get split brain.' },

    { type: 'mcq', q: 'Why does synchronous replication to **every** follower usually go unused?',
      options: ['One slow or dead follower would slow or block all writes', 'It makes the data less safe than asynchronous replication', 'Followers cannot understand the leader’s change log', 'It stops followers answering reads'],
      answer: 0,
      why: [null, 'It is actually the safest option, which is why people want it.', 'They read the same log in both modes.', 'Reads work the same either way.'],
      explain: 'A write cannot be confirmed until the slowest follower replies, so any follower hiccup becomes a write outage. Semi-synchronous (wait for one) is the usual compromise.' },

    { type: 'scenario', title: 'The vanishing order', intro: 'You run an online shop with one leader and two asynchronous followers. Customers sometimes place an order, land on "My orders", and see nothing. Support is being flooded.',
      meters: { 'customer trust': 50, 'speed': 70, 'complexity': 20 },
      steps: [
        { text: 'You look at the logs. The order was saved on the leader, but the "My orders" page read from a follower 300 ms behind. What do you call it, and what is your first fix?',
          choices: [
            { label: 'Replication lag causing a stale read; read from the leader right after a customer writes', score: 2, effects: { 'customer trust': 30, 'complexity': 5 }, feedback: 'Spot on. Read-your-writes for the user who just wrote cures the confusion, and everyone else keeps using cheap follower reads.' },
            { label: 'Make all replication synchronous', score: 1, effects: { 'customer trust': 15, 'speed': -30, 'complexity': 5 }, feedback: 'It does remove the lag, but every write now waits for the slowest follower. A heavy hammer for a narrow problem.' },
            { label: 'Tell customers to refresh the page', score: 0, effects: { 'customer trust': -20 }, feedback: 'Customers re-order, you ship duplicates, and trust drops further.' }
          ] },
        { text: 'At 2am the leader’s hardware dies. Monitoring detects it within 10 seconds. Your orchestration will promote Follower 1. What must you accept?',
          choices: [
            { label: 'Any writes not yet copied may be lost; and the old leader must not be allowed to write if it returns', score: 2, effects: { 'customer trust': 5, 'speed': -5 }, feedback: 'Exactly. Async means a tiny window of lost writes, and fencing the old leader prevents split brain.' },
            { label: 'Nothing is lost; replication guarantees it', score: 0, effects: { 'customer trust': -25 }, feedback: 'Async replication guarantees nothing about the last few milliseconds. Customers who ordered right before the crash may have no order.' },
            { label: 'Wait for the old leader to come back before promoting anyone', score: 0, effects: { 'speed': -40, 'customer trust': -20 }, feedback: 'Your shop is down until someone repairs the hardware. That defeats the point of having followers.' }
          ] },
        { text: 'A new request arrives: customers in Australia find the shop slow because the only leader is in Europe. Someone suggests a second leader in Sydney. What is the catch?',
          choices: [
            { label: 'Two leaders can accept conflicting changes to the same record, so you need conflict resolution', score: 2, effects: { 'speed': 25, 'complexity': 30 }, feedback: 'Right. Multi-leader gives fast local writes but real conflicts, such as two customers changing the same stock count. It is a deliberate trade.' },
            { label: 'None; more leaders always means better', score: 0, effects: { 'complexity': 30, 'customer trust': -20 }, feedback: 'Two leaders that cannot see each other’s writes will cheerfully disagree. Stock levels go wrong.' },
            { label: 'Put a read follower in Sydney instead, and keep one leader', score: 1, effects: { 'speed': 15, 'complexity': 10 }, feedback: 'A sound, simpler alternative for read-heavy traffic: local reads, writes still travel. Perhaps even the better first step.' }
          ] }
      ],
      outro: 'Replication is a set of trade-offs: **safe vs fast, simple vs local, and always the lag.**' },

    { type: 'short', q: 'What do we call the delay between a change reaching the leader and reaching a follower? (two words)', accept: ['replication lag', 'lag'], hint: 'It starts with "replication".',
      explain: '**Replication lag** is that gap. It is the cause of stale reads, and it grows when followers are overloaded or the network is slow.' }
  ],

  flashcards: [
    { q: 'In leader–follower replication, who accepts writes and who accepts reads?', a: 'All writes go to the leader. Reads can go to the leader or any follower.' },
    { q: 'Synchronous vs asynchronous replication?', a: 'Synchronous: the leader waits for the follower before confirming (safe, slower). Asynchronous: it confirms straight away (fast, but recent writes can be lost if the leader dies).' },
    { q: 'What is replication lag and what does it cause?', a: 'The delay before followers receive the leader’s changes. It causes stale reads, such as not seeing a change you just made.' },
    { q: 'What is split brain?', a: 'After a failover, two machines both think they are the leader and accept writes, so the data diverges. Prevented with majority votes and fencing.' },
    { q: 'Name the three replication topologies.', a: 'Single-leader (one writer), multi-leader (several writers, needs conflict resolution), leaderless (any node accepts writes; reads and writes use several nodes).' }
  ],

  glossary: [
    { term: 'Replication', def: 'Keeping copies of the same data on several machines and keeping them in step as it changes.', like: 'Photocopying a recipe so every kitchen has it.' },
    { term: 'Leader', def: 'The one machine that accepts writes and tells the followers what changed.', like: 'The head chef.', aka: ['primary', 'master'] },
    { term: 'Follower', def: 'A machine that copies the leader’s changes and serves reads.', like: 'A kitchen working from photocopies.', aka: ['replica', 'secondary'] },
    { term: 'Replication lag', def: 'How far behind a follower is. Reads from a lagging follower can return old data.' },
    { term: 'Failover', def: 'Promoting a follower to leader when the leader fails.', like: 'The deputy takes over when the head chef collapses.' },
    { term: 'Split brain', def: 'A failure where two machines both believe they are the leader and both accept writes.', like: 'Two captains each steering the same ship.' }
  ],

  takeaways: [
    'Replication = copies for **survival, read capacity and closeness**.',
    'Single leader takes the writes; followers replay its log and serve reads.',
    '**Async** is fast but can lose recent writes; **sync** is safe but slow. Lag causes **stale reads**: fix with read-your-writes.',
    'Failover is risky: you must avoid **split brain**. Multi-leader and leaderless trade simplicity for availability.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-sharding', {
  eli5: 'Sharding means cutting a big dataset into pieces and giving each piece to a different machine, so no single machine has to hold or handle everything. The art is deciding which piece each record goes to.',

  cards: [
    { kind: 'concept', title: 'When copies are not enough',
      body: `Replication gave every machine a **full** copy of the data. That helps with reads, but it has two limits:

        - Every machine must store **all** the data. When it no longer fits on one disk, copies do not help.
        - Every write still goes to **one leader**. When one machine cannot keep up with the writes, copies do not help either.

        The fix is to stop giving everyone everything. Cut the data into pieces and give each piece to a different machine. This is **sharding**, also called **partitioning**. Each piece is a **shard**; each machine owns only its slice, so both storage and writes are spread across the whole group.` },

    { kind: 'metaphor', title: 'The encyclopedia in volumes',
      body: `An old printed encyclopedia does not come as one giant book. It comes in volumes: A–C, D–F, and so on. To look up "Zebra" you grab the last volume. Nobody needs to carry the whole set.

        Sharding is the same trick, with two upgrades:

        - Each volume lives on a **different machine**, so lookups in different volumes run **in parallel**.
        - Each volume can itself have copies (replicas), so the loss of one machine does not lose the "Q" volume.

        Where the metaphor stops: books never get "too popular". In a database, one volume can suddenly be the one everybody wants, which is the hot-spot problem coming up.` },

    { kind: 'diagram', title: 'A router in front of the shards',
      body: 'Something has to know which shard owns which record. Usually it is a thin routing layer, or logic in the client library.',
      nodes: [
        { id: 'app', label: 'App server', icon: '🖥️', x: 1, y: 0 },
        { id: 'router', label: 'Router (shard map)', icon: '🧭', x: 1, y: 1, tone: 'accent' },
        { id: 's1', label: 'Shard 1: users A–H', icon: '🗄️', x: 0, y: 2, tone: 'info' },
        { id: 's2', label: 'Shard 2: users I–Q', icon: '🗄️', x: 1, y: 3, tone: 'info' },
        { id: 's3', label: 'Shard 3: users R–Z', icon: '🗄️', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'app', to: 'router', label: 'user "mia"' },
        { from: 'router', to: 's1', dashed: true },
        { from: 'router', to: 's2', label: 'goes here' },
        { from: 'router', to: 's3', dashed: true }
      ],
      caption: 'The router looks at the shard key (here, the username) and picks one shard. Other shards never hear about the request.' },

    { kind: 'compare', title: 'Three ways to decide who owns what',
      body: 'The **shard key** is the field you use to decide the shard (a user ID, a country, a date). The method is how the key turns into a shard.',
      cols: ['Range', 'Hash', 'Directory'],
      rows: [
        ['How', 'Key ranges: A–H, I–Q…', 'Hash the key, then pick by number', 'A lookup table: key to shard'],
        ['Range queries', 'Easy: neighbours sit together', 'Hard: neighbours scatter', 'Depends on the table'],
        ['Even spread', 'Risky: popular ranges', 'Usually very even', 'You control it'],
        ['Flexibility', 'Split a range when it grows', 'Fixed by the formula', 'Move any key anywhere'],
        ['Cost', 'Hot ranges (see below)', 'Lose cheap range scans', 'The table is a thing to keep safe']
      ] },

    { kind: 'code', title: 'Hash sharding in six lines',
      body: 'Tap the lines. This is the simplest method to understand, and it hides a nasty surprise.',
      code: { lang: 'js', src: `
        const shards = ['db-0', 'db-1', 'db-2'];

        function shardFor(userId) {
          const h = hash(userId);          // any stable number
          return shards[h % shards.length];
        }

        shardFor('mia');   // always the same shard` ,
        notes: {
          4: 'A **hash function** turns any key into a big, pseudo-random number. The same key always gives the same number. Nearby keys (`mia1`, `mia2`) land far apart, which spreads load evenly.',
          5: '`%` is the remainder after division. With 3 shards, every number maps to 0, 1 or 2.',
          8: 'Deterministic: any app server computes the same answer without asking anyone. That is the charm.'
        } },
      note: 'Do not use a language’s built-in per-process hash for this (some change between runs). Use a stable hash.' },

    { kind: 'pitfall', title: 'Hot spots: the unlucky shard',
      body: `Shards only help if the work spreads out. When one shard gets far more traffic than the rest, it is a **hot spot**, and it limits the whole system.

        Classic causes:

        - **A timestamp as the key** with range sharding. All new writes are "now", so one shard takes every write while the others sit idle.
        - **A celebrity.** A hash spreads *users* evenly, but one account with 50 million followers can melt its shard.
        - **A low-variety key**, such as "country": most traffic may come from two countries.

        Good shard keys have **many distinct values**, are **spread evenly** and show up in **most queries** (so the router can skip the other shards).` },

    { kind: 'concept', title: 'Rebalancing, and why "mod N" hurts',
      body: `Data grows, so you must add shards. With hash-mod-N this is nasty. Change from 3 shards to 4 and every key's answer changes, because the remainder is now taken against 4, not 3.

        Take keys 0 to 11. With 3 shards, key \`k\` lives on \`k % 3\`. With 4 shards, on \`k % 4\`. Only keys 0, 1 and 2 stay put; **9 of 12 keys (75%) must move**. In general, adding one shard to N moves about N out of every N+1 keys.

        Moving most of your data while real users are reading it is slow, risky and can make every cache miss at once. We need a scheme where adding a shard moves only *a fair share* of keys.` },

    { kind: 'steps', title: 'Consistent hashing: moving only what must move',
      body: 'The trick behind Cassandra, DynamoDB and many caches. Step through it.',
      steps: [
        { title: 'Draw a circle', body: 'Imagine all hash values arranged around a **ring**, from 0 up to a maximum, where the end joins the start again.' },
        { title: 'Place the machines on the ring', body: 'Hash each machine’s name to get its position. Three machines become three points on the circle.' },
        { title: 'Place each key too', body: 'Hash the key to a point on the same ring, then walk **clockwise** to the first machine. That machine owns the key.' },
        { title: 'Add a machine', body: 'The new machine lands at one point and takes over only the keys between it and its anticlockwise neighbour. Every other key stays where it was. Roughly 1 in N+1 keys move, not almost all of them.' },
        { title: 'Use virtual nodes for fairness', body: 'Three points can leave uneven gaps. So each machine is placed at **many** points (virtual nodes). The ring is then evenly divided and a dead machine’s load is shared among many neighbours.' }
      ],
      note: 'The lab that follows lets you add and remove nodes and count how many keys each method moves.' },

    { kind: 'realworld', title: 'The costs, and who does it for you',
      body: `Sharding is powerful and it is **not free**:

        - A query that needs several shards (a **cross-shard query**, such as "top sellers across all customers") must ask every shard and merge the answers.
        - **Joins** across shards are slow or unsupported, and transactions across shards need the heavy machinery in the last lesson.
        - Changing the shard key later is a painful migration.

        Many databases do the splitting for you: MongoDB, Cassandra, DynamoDB and Elasticsearch partition automatically, and tools such as Vitess shard MySQL. Relational databases like PostgreSQL can also split a table on one machine (called partitioning) as a first step.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'You shard an orders table by order date, using ranges (one shard per month). What is the most likely problem?',
      options: ['All current writes hit the newest shard, which becomes a hot spot', 'Old orders become impossible to read', 'The hash function gives uneven results', 'Replication stops working'],
      answer: 0,
      why: [null, 'Reading old months works fine; those shards are just quiet.', 'There is no hash in range sharding.', 'Replication is a separate matter.'],
      explain: 'New data is always "now", so one range receives all the writes while earlier shards sit idle. A key with an even, many-valued spread (such as order ID hashed) avoids this.' },

    { type: 'match', after: 3, prompt: 'Match each sharding method to what it does best or worst.',
      pairs: [['Range', 'Easy range scans, risky hot ranges'], ['Hash', 'Even spread, scattered neighbours'], ['Directory', 'Move any key anywhere via a lookup table'], ['Shard key', 'The field that decides the shard'], ['Hot spot', 'One shard gets far more traffic']],
      explain: 'Each method is a trade: range keeps neighbours together, hash spreads them, and a directory is the most flexible but needs its own lookup table kept safe.' },

    { type: 'spot', prompt: 'A team picks a shard key for a chat app. Tap the line that will cause the most trouble.',
      code: { lang: 'js', src: `
        // Chat messages are stored in 8 shards.
        function shardForMessage(msg) {
          return shards[hash(msg.userId) % 8];
        }
        function shardForUserFeed(user) {
          return shards[hash(user.country) % 8];
        }` },
      lines: [6],
      explain: 'Country has few distinct values and very uneven traffic, so a few shards would take most of the load and others sit nearly empty. A user ID (line 3) has many values and spreads well.' },

    { type: 'bucket', prompt: 'Good shard key or poor shard key for a large social app?', buckets: ['Good key', 'Poor key'],
      items: [['User ID (hashed)', 0], ['Post ID (hashed)', 0], ['Country', 1], ['Signup date', 1], ['Is the user verified? (yes/no)', 1], ['Conversation ID, for a chat app', 0]],
      explain: 'Good keys have many distinct values, spread traffic evenly and appear in most queries. Boolean flags, country and dates have too few values or concentrate recent traffic.' },

    { type: 'estimate', q: 'You use hash-mod-N with 9 shards and add a 10th. About what percentage of keys change shard?',
      answer: 90, unit: '% of keys', min: 1, max: 100, tolerance: 1.2,
      explain: 'With mod N, adding one shard to N moves about N out of N+1 keys: 9 out of 10, so roughly 90%. With consistent hashing only about 1 in 10 (10%) would move.' },

    { type: 'tf', statement: 'With consistent hashing, adding a new machine forces almost all keys to be reassigned, just like hash-mod-N.', answer: false,
      explain: 'Only the keys between the new machine and its anticlockwise neighbour move: about 1 in N+1. That is the entire point of the ring.' },

    { type: 'order', prompt: 'Put the lookup of a key on a consistent-hash ring in order.',
      items: ['Hash the key to a position on the ring', 'Walk clockwise from that position', 'Reach the first machine on the ring', 'Send the read or write to that machine'],
      explain: 'The key’s position is fixed by its hash; the owner is simply the next machine clockwise. Add or remove machines and only nearby keys are affected.' },

    { type: 'scenario', title: 'The celebrity shard', intro: 'Your social app stores posts in 8 shards, hashed by user ID. All is calm until a pop star with 40 million followers joins. Their shard’s CPU hits 100%, and everyone else on that shard is slow.',
      meters: { 'latency': 40, 'complexity': 20, 'budget': 60 },
      steps: [
        { text: 'The dashboard shows shard 5 on fire and the rest idle. What is the actual diagnosis?',
          choices: [
            { label: 'A hot spot: one key is getting far more traffic than a single shard can absorb', score: 2, effects: { 'latency': 10 }, feedback: 'Right. Hashing spread the users evenly, but not the traffic. One very popular key is a problem no key-to-shard formula can fix on its own.' },
            { label: 'The hash function is broken', score: 0, effects: { 'budget': -10, 'complexity': 10 }, feedback: 'The spread across users is fine. Swapping hash functions will not make one account less popular.' },
            { label: 'You simply need more shards', score: 1, effects: { 'budget': -20, 'complexity': 20 }, feedback: 'More shards will not help: the celebrity’s key still maps to exactly one shard. You would pay for machines that do nothing.' }
          ] },
        { text: 'What is a sensible fix for that one hot account?',
          choices: [
            { label: 'Cache their posts and add extra replicas for that shard; split the key (e.g. user ID plus a number) for heavy accounts', score: 2, effects: { 'latency': -25, 'complexity': 20, 'budget': -10 }, feedback: 'Reads are the issue, so caches and replicas take the heat; spreading one key over several sub-keys handles writes. Special cases for special keys are normal.' },
            { label: 'Ban celebrities from the app', score: 0, effects: { 'latency': -10, 'budget': -30 }, feedback: 'Technically effective, commercially a disaster.' },
            { label: 'Switch every user to range sharding by signup date', score: 0, effects: { 'complexity': 30, 'latency': 20 }, feedback: 'You would trade one hot spot for another: new signups all hit the newest shard. Worse, you would migrate everything.' }
          ] },
        { text: 'Growth continues and you need to go from 8 to 10 shards. How do you add them with minimum pain?',
          choices: [
            { label: 'Use a scheme with consistent hashing (or many small partitions), so only a share of keys moves', score: 2, effects: { 'latency': -10, 'complexity': 10 }, feedback: 'Yes. With the ring or with many fixed small partitions assigned to machines, you move only what you must, and stay online.' },
            { label: 'Change the formula from % 8 to % 10 and restart', score: 0, effects: { 'latency': 40, 'complexity': 20 }, feedback: 'About 80% of all keys would suddenly be on the wrong shard. Every read misses until the move completes.' },
            { label: 'Take the app offline for a weekend and reshuffle', score: 1, effects: { 'budget': -20 }, feedback: 'It works, but it is the approach you adopt only when you have nothing better.' }
          ] }
      ],
      outro: 'Remember: **even keys are not even traffic.** Watch hot spots, and choose a scheme that adds machines gracefully.' }
  ],

  flashcards: [
    { q: 'Replication vs sharding?', a: 'Replication copies the same data to several machines. Sharding splits different data across machines. Real systems usually do both.' },
    { q: 'Range, hash and directory sharding in one line each?', a: 'Range: contiguous key ranges per shard. Hash: hash the key, spread evenly, lose range scans. Directory: a lookup table assigns keys to shards, fully flexible.' },
    { q: 'What makes a good shard key?', a: 'Many distinct values, an even spread of traffic, and presence in most queries so the router can skip other shards.' },
    { q: 'What is a hot spot?', a: 'A shard that receives much more load than the others (a timestamp key, a celebrity account), limiting the whole system.' },
    { q: 'Why is consistent hashing better than hash-mod-N?', a: 'Adding or removing a node moves only about 1 in N keys, not nearly all of them.' }
  ],

  glossary: [
    { term: 'Sharding', def: 'Splitting a dataset into pieces and storing each piece on a different machine, so no machine holds everything.', like: 'An encyclopedia in volumes on different shelves.', aka: ['partitioning', 'horizontal partitioning'] },
    { term: 'Shard key', def: 'The field whose value decides which shard a record lives on, such as user ID.', like: 'The first letter that tells you which volume to pull down.', aka: ['partition key'] },
    { term: 'Hot spot', def: 'A shard (or key) that receives far more traffic than the others and becomes the bottleneck.' },
    { term: 'Consistent hashing', def: 'A way of assigning keys to machines on a ring so adding or removing a machine moves only a small share of keys.', like: 'Seating guests round a circular table: a newcomer only displaces the neighbour beside them.' },
    { term: 'Cross-shard query', def: 'A query that needs data from several shards, so it must ask all of them and merge the answers. Slower than a single-shard query.' }
  ],

  takeaways: [
    '**Sharding** splits the data itself, so both storage and writes spread across machines.',
    'Range = easy scans, risky hot ranges. Hash = even spread, no scans. Directory = flexible, needs a lookup table.',
    'A good **shard key** has many values, even traffic and shows up in most queries.',
    '**Consistent hashing** moves about 1 in N keys when adding a node; hash-mod-N moves almost all.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-cap', {
  eli5: 'If the link between two copies of your data breaks, each side has to choose: refuse to answer so nobody sees wrong data, or keep answering and risk being out of date. CAP is the name for that unavoidable choice.',

  cards: [
    { kind: 'metaphor', title: 'Two bank branches and a cut phone line',
      body: `A bank has two branches that keep the same account balances, updating each other by phone. You have £100.

        At 10:00 the phone line is cut. At 10:05 you withdraw £100 at branch A, which records £0. At 10:10 your partner, at branch B, asks for the balance. Branch B cannot reach A to check. What should the clerk do?

        - **Refuse**: "Sorry, we can't confirm, come back later." Nobody gets a wrong answer, but the branch is not much use.
        - **Answer from what it knows**: "£100." The branch is helpful, but the answer is wrong, and your partner could withdraw money that no longer exists.

        There is no third option while the line is cut. That tension is the whole CAP theorem.` },

    { kind: 'concept', title: 'The three letters, defined carefully',
      body: `CAP names three properties of a distributed data store, and each has a narrower meaning than the everyday word:

        - **Consistency (C):** every read sees the most recent write. The system behaves as if there were a single copy of the data.
        - **Availability (A):** every request to a working node gets a real answer (not an error or a timeout), though not necessarily the freshest.
        - **Partition tolerance (P):** the system keeps working even when the network loses or delays messages between nodes. A **network partition** is exactly that: the nodes are alive but cannot talk.

        Be careful: this "consistency" is **not** the "C" in ACID (which meant your own data rules hold). Here it means all copies agree, like read-your-writes for everyone.` },

    { kind: 'sequence', title: 'A partition forces the choice',
      body: 'Two nodes hold the same value. Then the link between them breaks. Step through.',
      actors: ['Client 1', 'Node A', 'Node B'],
      steps: [
        { from: 0, to: 1, label: 'write x = 5', note: 'A client writes to Node A. Normally A would instantly tell B.' },
        { from: 1, to: 2, label: 'replicate x = 5', dashed: true, note: '**The network partition:** this message never arrives. Both nodes are fine; the link between them is not.' },
        { from: 1, to: 0, label: 'OK', note: 'Node A accepted the write, so A now holds the new value and B the old one.' },
        { note: 'Now another client asks Node B for x. B cannot check with A. It must pick one of two answers.' },
        { at: 2, label: 'choice 1: error (CP)', note: '**Choose consistency:** B refuses, "I can’t be sure". No wrong data is returned, but the system is partly **unavailable**.' },
        { at: 2, label: 'choice 2: answer x = 4 (AP)', note: '**Choose availability:** B answers with what it has. The system stays up, but the read is **stale**: not consistent.' }
      ] },

    { kind: 'concept', title: 'You only choose during a partition',
      body: `You will see CAP drawn as a triangle, with the advice "pick two of three". That is misleading.

        **Partitions are not optional.** Networks fail: cables get cut, switches reboot, data centres lose contact. A system spread over several machines must tolerate that, so P is a fact you live with, not a feature you choose.

        The real choice is: **when a partition happens, do you give up Consistency or Availability?**

        When the network is healthy, you can have both. The trade-off appears only during the fault, as in the bank story. (A single machine has no partitions, so CAP does not even apply.)`,
      note: 'The lab that follows lets you cut the network between two nodes and choose, then see the cost of each choice.' },

    { kind: 'compare', title: 'CP versus AP: what each choice feels like',
      body: 'Which side suits you depends on what a wrong answer costs. Names below describe typical default behaviour; many systems can be tuned.',
      cols: ['CP: favour consistency', 'AP: favour availability'],
      rows: [
        ['During a partition', 'Some requests are refused or time out', 'Everyone gets an answer, maybe stale'],
        ['Data afterwards', 'Never diverged', 'Copies diverged and must be merged'],
        ['Good for', 'Money, locks, leader election, inventory', 'Feeds, likes, carts, sensor data'],
        ['Typical examples', 'etcd, ZooKeeper, Consul', 'Cassandra, DynamoDB, CouchDB'],
        ['A wrong answer costs', 'More than a short outage', 'Less than a short outage']
      ] },

    { kind: 'pitfall', title: 'Four common misreadings of CAP',
      body: `CAP is often quoted and often misused. Watch for these:

        1. **"Pick any two."** You cannot give up P. The choice is C or A, and only **during** a partition.
        2. **"Availability means uptime."** In CAP it means every working node answers. A CP system can have 99.99% uptime; it only refuses requests in the rare partition.
        3. **"A database is either CP or AP."** Real systems are tunable and can differ per operation, as you will see with quorums in lesson 5.
        4. **"Consistency here means ACID consistency."** It does not. It means the *same value everywhere*.

        And it says nothing about speed, which is where PACELC comes in.` },

    { kind: 'concept', title: 'PACELC: the part CAP leaves out',
      body: `Even with no partition, copying data takes time. So a replicated system has a second trade-off every day. **PACELC** (say "pass-elk") sums it up:

        > If there is a **P**artition, choose **A**vailability or **C**onsistency. **E**lse (all is well), choose **L**atency or **C**onsistency.

        To be fully consistent you must wait for copies to confirm, which costs **latency**. To be fast, you answer from the nearest copy and accept staleness.

        Labels you will see: **PA/EL** (available in a partition, low-latency otherwise, such as Dynamo-style stores) and **PC/EC** (consistent always, such as systems built for strong consistency like Google Spanner). Most systems let you tune this.` },

    { kind: 'tip', title: 'Choose per feature, not per company',
      body: `The best designs mix both. One shop can run on several kinds of data:

        - **Shopping cart:** better to let a customer add an item during a partition than to show an error. Two diverging carts can be merged later. Lean **AP**.
        - **Stock count for the last item, and payment:** selling the last unit twice, or charging twice, is costly. Lean **CP**: a polite error beats a wrong answer.
        - **Product reviews, "likes", view counters:** nobody is harmed by a slightly old number. Lean **AP**.

        Ask: *"If this answer is wrong for a few seconds, what happens?"* Then choose.` }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'CAP says you must always give up one of consistency, availability or partition tolerance, even when the network is perfectly healthy.', answer: false,
      explain: 'The trade-off only bites during a partition. When the network is healthy you can have both consistency and availability. And partitions are a fact of life, so P is not really something you drop.' },

    { type: 'mcq', after: 4, q: 'A network partition cuts Node B off from Node A. A client asks B for a value. B returns an error rather than a possibly-stale answer. B is behaving as…',
      options: ['CP: it preserved consistency and gave up availability', 'AP: it preserved availability', 'Neither: this is a bug', 'CA: it avoided the partition'],
      answer: 0,
      why: [null, 'AP would have answered with whatever it had.', 'Refusing to answer wrongly is a deliberate and common design.', 'A "CA" distributed system does not exist in practice, since partitions will happen.'],
      explain: 'Refusing to answer protects correctness at the cost of availability for that request: a CP choice.' },

    { type: 'bucket', prompt: 'Lean CP (refuse rather than be wrong) or AP (answer even if stale)?', buckets: ['CP', 'AP'],
      items: [['Debiting a bank account', 0], ['Showing a "like" count', 1], ['Booking the last concert seat', 0], ['Adding an item to a shopping cart', 1], ['Electing which server is the leader', 0], ['Loading a social-media feed', 1], ['Showing the last-seen time of a friend', 1]],
      explain: 'Ask what a wrong answer costs. Money, locks and unique resources must be correct; feeds, counters and carts tolerate being briefly stale and can be reconciled later.' },

    { type: 'multi', q: 'Which of these statements about CAP are true?',
      options: ['The trade-off between C and A only applies when a partition happens', 'Partition tolerance is something you can choose to skip in a distributed system', '"Availability" in CAP means every working node answers requests', 'CAP "consistency" and ACID "consistency" mean the same thing', 'A system can behave differently for different operations'],
      answers: [0, 2, 4],
      explain: 'Networks will fail, so P is a given. CAP-C means all copies agree, which differs from ACID-C. And modern databases often let you choose per query.' },

    { type: 'cloze', text: 'During a network {{partition}}, a system must choose between {{consistency}} and {{availability}}. PACELC adds that, when there is no partition, it must trade {{latency}} against consistency.',
      distractors: ['durability', 'bandwidth', 'isolation'],
      explain: 'CAP is the partition half of the story; PACELC adds the "else" half, about the price of staying consistent when things are fine.' },

    { type: 'short', q: 'In PACELC, what does the "L" stand for?', accept: ['latency'], hint: 'How long a reply takes.',
      explain: 'The "else" part says that without a partition you trade **latency** for consistency: waiting for all copies is slower than answering from the nearest one.' },

    { type: 'scenario', title: 'Choose your side', intro: 'You are designing the data layer for a ticketing app. During a partition between two data centres, you must decide how each feature behaves. Choose the right side of CAP for each.',
      meters: { 'user trust': 70, 'revenue': 70, 'uptime': 80 },
      steps: [
        { text: 'The "buy seat 14C" operation. Two data centres cannot talk to each other. Customers in both are trying to buy the last seats.',
          choices: [
            { label: 'Refuse purchases that cannot be confirmed on the authoritative side (CP)', score: 2, effects: { 'user trust': 10, 'uptime': -10, 'revenue': -5 }, feedback: 'A short "try again in a moment" is far cheaper than selling one seat to two people. Correctness wins where a wrong answer costs real money and real anger.' },
            { label: 'Accept all purchases on both sides (AP) and sort it out later', score: 0, effects: { 'user trust': -35, 'revenue': -20 }, feedback: 'Both sides sell 14C. Afterwards someone gets an apology and a refund instead of a seat, and your support inbox fills up.' },
            { label: 'Shut down the whole app until the link is repaired', score: 1, effects: { 'uptime': -40, 'revenue': -30 }, feedback: 'Correct but far too blunt. You can serve other features and refuse only what truly needs agreement.' }
          ] },
        { text: 'The "event page": description, photos and "1,204 people are watching".',
          choices: [
            { label: 'Keep serving it from the local copy (AP); a stale number is fine', score: 2, effects: { 'uptime': 10, 'user trust': 5 }, feedback: 'Nobody is hurt by a slightly old watcher count, and the page staying up keeps customers browsing.' },
            { label: 'Return an error until the data centres agree (CP)', score: 0, effects: { 'uptime': -25, 'revenue': -15 }, feedback: 'A broken page to protect a vanity counter. Customers leave.' },
            { label: 'Show a "service unavailable" banner but cache nothing', score: 0, effects: { 'uptime': -20, 'user trust': -10 }, feedback: 'You pay the cost of being unavailable with no consistency benefit.' }
          ] },
        { text: 'The link is repaired, and you are talking to the team about the next quarter. What is the accurate way to describe the system you built?',
          choices: [
            { label: 'Per feature: CP where wrong answers are costly, AP where they are cheap; plus tuning for latency when healthy', score: 2, effects: { 'user trust': 10 }, feedback: 'That is how real systems are described: tuned per operation, with PACELC’s everyday latency trade-off in mind.' },
            { label: 'It is a CA system, because we never lose consistency or availability', score: 0, effects: { 'user trust': -5 }, feedback: 'CA claims you avoid partitions. In a distributed system you cannot, so this really means "we have not been tested yet".' },
            { label: 'It is "2 out of 3" so we are fine', score: 1, effects: {}, feedback: 'The pick-two summary hides that P is not optional, and that the choice only appears in a fault.' }
          ] }
      ],
      outro: 'CAP is not a classification stamp. It is a question to ask of **each feature**: when the network splits, would a wrong answer or no answer hurt more?' },

    { type: 'explain', prompt: 'Explain in your own words why "CAP: pick two of three" is a misleading summary.',
      model: 'Partitions (broken or slow networks) will happen in any distributed system, so you cannot really choose to give up partition tolerance. The actual choice is between consistency and availability, and it only matters while a partition is happening. When the network is healthy you can have both. So it is better to say: when the network splits, do you refuse to answer (consistent) or answer possibly-stale data (available)?',
      keywords: ['partition', 'not optional', 'only during', 'consistency', 'availability', 'healthy'] }
  ],

  flashcards: [
    { q: 'What do C, A and P stand for in CAP?', a: 'Consistency (every read sees the latest write), Availability (every working node answers), Partition tolerance (keeps working despite lost or delayed messages between nodes).' },
    { q: 'When does the CAP trade-off actually apply?', a: 'Only during a network partition. Then you must choose to refuse some requests (consistent) or answer with possibly stale data (available).' },
    { q: 'CP vs AP in one line each?', a: 'CP refuses requests it cannot answer correctly. AP always answers but may return stale data and must merge diverged copies later.' },
    { q: 'What does PACELC add to CAP?', a: 'When there is no partition (Else), there is still a trade-off between Latency and Consistency.' },
    { q: 'Is CAP "consistency" the same as ACID "consistency"?', a: 'No. CAP consistency means all copies agree and reads see the latest write. ACID consistency means a transaction keeps your data rules (constraints) valid.' }
  ],

  glossary: [
    { term: 'Network partition', def: 'A fault where machines are alive but cannot reach each other because the network between them has failed or is too slow.', like: 'A cut phone line between two bank branches.' },
    { term: 'CAP theorem', def: 'In a distributed data store, when a network partition happens you can keep either consistency or availability, not both.' },
    { term: 'Consistency (CAP)', def: 'Every read returns the most recent write, as if there were a single copy of the data.', aka: ['linearizability'] },
    { term: 'Availability (CAP)', def: 'Every request to a non-failing node gets an actual response, not an error, though the data may be old.' },
    { term: 'PACELC', def: 'An extension of CAP: if Partition, choose Availability or Consistency; Else, choose Latency or Consistency.', like: 'CAP plus the everyday cost of waiting for copies to agree.' }
  ],

  takeaways: [
    'A **partition** means nodes cannot talk. Then you choose: **consistent** (refuse) or **available** (answer, maybe stale).',
    '"Pick two" misleads: **P is not optional**, and the choice only exists during a partition.',
    '**CP** suits money and uniqueness; **AP** suits feeds, carts and counters. Choose per feature.',
    '**PACELC**: even when healthy, you trade **latency** against consistency.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-consistency', {
  eli5: 'With several copies of your data, "consistent" is a sliding scale, not a yes or no. Eventual consistency promises that all copies will agree if you wait, and quorums and merge rules are how real systems keep that wait short and safe.',

  cards: [
    { kind: 'concept', title: 'Two friends, two screens, two answers',
      body: `You and a friend open the same photo at the same instant. You see 1,204 likes; she sees 1,201. A second later you both see 1,206.

        Was the app broken? Not really. The like count lives on several copies, and the copies were catching up. For a like counter, that is a perfectly fine trade for speed and availability.

        For a bank balance it would not be fine. So "how consistent?" is a **dial**, and this lesson walks along it:

        - **Strong consistency:** every read sees the latest write, as if there were one copy.
        - **Eventual consistency:** if writes stop, all copies **eventually** agree. Until then, anything goes.
        - Several useful promises in between.` },

    { kind: 'metaphor', title: 'Gossip in a village',
      body: `Someone in a village hears big news. She tells two neighbours, who each tell two more. By the end of the day the whole village knows.

        But at 3pm, the baker has heard and the blacksmith has not. Ask each of them and you get different answers. Nobody is lying; the news is still travelling. And if two people tell different versions of the news, the village needs some way to decide which wins.

        That is **eventual consistency**: everyone converges, given time and no new news, but the in-between state is messy.

        Where the metaphor stops: computers can also use **rules** (like quorums, next) to bound how messy the in-between gets.` },

    { kind: 'compare', title: 'Strong vs eventual, and the useful middle',
      body: 'Stronger guarantees cost more latency and availability. Pick the weakest one your feature can live with.',
      cols: ['Strong', 'Eventual'],
      rows: [
        ['A read returns', 'The latest write, always', 'Possibly an older value'],
        ['Cost', 'Wait for copies; slower, less available', 'Fast and always available'],
        ['During a partition', 'Some requests refused (CP)', 'Everyone answered (AP)'],
        ['Good for', 'Balances, stock, unique names', 'Likes, feeds, caches, counters'],
        ['Middle ground', 'Read-your-writes, monotonic reads', 'Often what "eventual" really means']
      ] },

    { kind: 'sequence', title: 'Time running backwards (monotonic reads)',
      body: 'Eventual consistency has a nasty trick. Two followers, one lagging. Step through.',
      actors: ['You', 'Follower 1', 'Follower 2'],
      steps: [
        { from: 0, to: 1, label: 'show comments', note: 'You load a post. The request lands on Follower 1, which is fully up to date.' },
        { from: 1, to: 0, label: '3 comments', note: 'You see three comments, including your friend’s new one.' },
        { from: 0, to: 2, label: 'refresh', note: 'You refresh. This time the load balancer picks Follower 2, which is **lagging**.' },
        { from: 2, to: 0, label: '2 comments', note: 'The comment you just saw has **disappeared**. From your point of view, time went backwards.' },
        { note: '**Monotonic reads** promises this never happens: once you have seen a value, you never see an older one. A common implementation is to always send the same user to the same follower. **Read-your-writes** is the sibling promise: you always see your own writes.' }
      ] },

    { kind: 'concept', title: 'Quorums: voting for a safe read',
      body: `Take a leaderless store (from the replication lesson) with **N copies** of each record. Instead of trusting one machine, use a vote:

        - A write must be confirmed by **W** copies before it is accepted.
        - A read asks **R** copies and takes the newest answer.

        If **R + W > N**, any set of R copies must overlap with any set of W copies, so **at least one copy you read has the latest write**. That is a **quorum**.

        Example, N = 3: W = 2 and R = 2 gives 4 > 3, so reads see the latest write. W = 1 and R = 1 gives 2, which is not more than 3: reads *can* be stale, but they are very fast.

        Tune W and R to choose where you sit on the dial.` },

    { kind: 'diagram', title: 'Why the overlap guarantees a fresh read',
      body: 'N = 3 copies. A write reached nodes A and B (W = 2). A read asks B and C (R = 2).',
      nodes: [
        { id: 'w', label: 'Write x = 9', icon: '✍️', x: 0, y: 0, tone: 'accent' },
        { id: 'a', label: 'Node A: x = 9', x: 0, y: 1, tone: 'good' },
        { id: 'b', label: 'Node B: x = 9', x: 1, y: 1, tone: 'good' },
        { id: 'c', label: 'Node C: x = 7 (old)', x: 2, y: 1, tone: 'warn' },
        { id: 'r', label: 'Read x', icon: '👀', x: 2, y: 0, tone: 'info' }
      ],
      edges: [
        { from: 'w', to: 'a', label: 'ack' },
        { from: 'w', to: 'b', label: 'ack' },
        { from: 'r', to: 'b', label: 'x = 9' },
        { from: 'r', to: 'c', label: 'x = 7', dashed: true }
      ],
      caption: 'The read sees both 9 (from B) and 7 (from C). It keeps the newer, 9. B is the overlap. The lab that follows lets you change N, R and W.' },

    { kind: 'concept', title: 'Conflicts, round one: last write wins',
      body: `Eventual consistency has a second problem: **conflicts**. During a partition, two people edit the same record on different copies. When the copies reconnect, which edit survives?

        The simplest rule is **last write wins (LWW)**: each write carries a timestamp, and the highest timestamp wins. Easy, always converges, and used by many systems.

        The catch: the losing write is silently thrown away. And "last" depends on **clocks**, which on different machines are never perfectly in step. A write that really happened later can lose because its machine's clock ran slow.

        LWW is fine for "last seen online". It is dangerous for anything where both edits matter, like two people adding different items to the same cart.` },

    { kind: 'deep', title: 'Conflicts, round two: vector clocks',
      body: `Instead of guessing with timestamps, a system can **detect** whether two writes were truly concurrent. A **vector clock** attaches a small counter per machine to each version.

        Cart starts at \`{A:1}\`. A client on machine A adds milk: \`{A:2}\`. Meanwhile, cut off from A, a client on machine B adds eggs to the *old* cart: \`{A:1, B:1}\`.

        Compare them. Neither version includes everything the other knows (\`A:2\` beats \`A:1\`, but \`B:1\` beats nothing), so they are **concurrent**: a genuine conflict. A version with a larger-or-equal counter everywhere simply *replaces* an older one and needs no fuss.

        The system keeps **both** versions ("siblings") and lets the application merge them: milk **and** eggs. Dynamo-style stores like Riak popularised this.`,
      note: 'Vector clocks are conceptual here. What matters is the idea: track causality instead of trusting wall-clock time.' },

    { kind: 'code', title: 'CRDTs: data that merges itself',
      body: 'A **CRDT** (conflict-free replicated data type) is a data structure designed so that any two copies can always be merged automatically, with the same result in any order. Here is the simplest one: a counter.',
      code: { lang: 'js', src: `
        // Each replica only ever increments its OWN slot.
        // A grow-only counter: { A: 3, B: 5 } means A counted 3, B counted 5.
        function increment(counter, me) {
          return { ...counter, [me]: (counter[me] || 0) + 1 };
        }
        function merge(x, y) {
          const out = { ...x };
          for (const id in y) out[id] = Math.max(out[id] || 0, y[id]);
          return out;
        }
        const total = c => Object.values(c).reduce((a, b) => a + b, 0);`,
        notes: {
          4: 'Each machine bumps only its own slot, so two machines can never both write the same slot.',
          7: 'Merge takes the **larger** value per slot. It does not matter who merges first, or how many times: the result is the same.',
          9: 'The total is the sum of all slots. Two replicas that each counted 2 likes while split give a total of 4 after merging, with nothing lost.'
        } },
      note: 'Collaborative editors and some databases use CRDTs for counters, sets and text. They fit data where "merge" has a natural meaning; they are not a magic fix for all conflicts.' }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'Under eventual consistency, a user can refresh a page and see an older value than they saw a moment ago, unless the system also promises monotonic reads.', answer: true,
      explain: 'If successive reads land on copies at different stages of catching up, the second can be older than the first. Monotonic reads rule that out, often by pinning a user to one copy.' },

    { type: 'multi', after: 5, q: 'You have N = 3 copies. Which (W, R) settings guarantee that a read overlaps with the most recent write?',
      options: ['W = 1, R = 1', 'W = 2, R = 2', 'W = 3, R = 1', 'W = 1, R = 3', 'W = 2, R = 1'],
      answers: [1, 2, 3],
      explain: 'The rule is R + W > N, so the sums must be at least 4. (2,2), (3,1) and (1,3) qualify. (1,1) is 2 and (2,1) is 3, so reads may miss the newest write.' },

    { type: 'short', q: 'With N = 5 copies and W = 3, what is the smallest R that guarantees a quorum read? (a number)', accept: ['3', 'three'], hint: 'R + W must be greater than N.',
      explain: 'R + 3 must exceed 5, so R must be at least 3. With R = 2 the sums only reach 5, which is not strictly greater.' },

    { type: 'match', prompt: 'Match each idea to what it gives you.',
      pairs: [['Eventual consistency', 'Copies agree if writes stop'], ['Read-your-writes', 'You see your own changes'], ['Monotonic reads', 'You never go back to older data'], ['Quorum (R + W > N)', 'A read overlaps the latest write'], ['Last write wins', 'Highest timestamp survives a conflict']],
      explain: 'The first three are promises about what a client sees. Quorums are a mechanism to get fresh reads; last-write-wins is a rule for resolving conflicts.' },

    { type: 'bucket', prompt: 'Which conflict strategy suits each situation best?', buckets: ['Last write wins is fine', 'Needs merging (CRDT / siblings)'],
      items: [['A user’s "last seen online" time', 0], ['A profile photo replaced twice', 0], ['Two people adding different items to one cart', 1], ['A shared "likes" counter on several replicas', 1], ['Two people editing different paragraphs of one document', 1], ['A cached copy of weather data', 0]],
      explain: 'If only the newest value matters, dropping the older one is fine. If both edits carry information, throwing one away loses data, so you need a merge.' },

    { type: 'cloze', text: 'A vector clock helps a system {{detect}} whether two writes were {{concurrent}}, whereas last-write-wins simply trusts {{timestamps}}, which depend on machine {{clocks}}.',
      distractors: ['encrypt', 'sequential', 'indexes'],
      explain: 'Vector clocks track which version has seen which; last-write-wins guesses with clocks that are never perfectly aligned.' },

    { type: 'scenario', title: 'The like counter and the wallet', intro: 'You are on the data team for a social app with a built-in wallet. Your database is a leaderless, tunable store with N = 3 copies. You must set W and R for three kinds of data.',
      meters: { 'speed': 60, 'correctness': 60, 'cost': 70 },
      steps: [
        { text: 'The post "like" counter: millions of updates, nobody minds being a few off for a moment. Which setting?',
          choices: [
            { label: 'W = 1, R = 1, with a CRDT-style counter that merges', score: 2, effects: { 'speed': 30, 'correctness': 5 }, feedback: 'Fast and always available. A merging counter means no like is lost when copies reconcile, and brief staleness is harmless.' },
            { label: 'W = 3, R = 3, wait for everyone every time', score: 0, effects: { 'speed': -25, 'cost': -15 }, feedback: 'Every like now waits for all three machines, and if one is down, nobody can like anything. Overkill for a counter.' },
            { label: 'W = 1, R = 1, last write wins on the count', score: 1, effects: { 'speed': 20, 'correctness': -15 }, feedback: 'LWW would overwrite one replica’s count with another’s and quietly lose likes. Fast, but the wrong merge rule.' }
          ] },
        { text: 'Wallet balance. A wrong read could let someone overspend. What do you choose?',
          choices: [
            { label: 'W = 2, R = 2 so reads overlap writes (or a strongly consistent store for money)', score: 2, effects: { 'correctness': 30, 'speed': -10 }, feedback: 'R + W > N, so reads see the latest write. Many teams go further and keep money in a strongly consistent relational database, which is a fair choice.' },
            { label: 'W = 1, R = 1 for speed', score: 0, effects: { 'correctness': -35, 'speed': 15 }, feedback: 'A stale balance read can approve a second purchase the customer cannot afford.' },
            { label: 'W = 1, R = 3', score: 1, effects: { 'correctness': 15, 'speed': -10 }, feedback: 'Sums to 4, so reads do overlap. But a write on a single copy is risky: if that copy dies before replicating, the write is lost.' }
          ] },
        { text: 'Two people edit the same shared shopping list at the same moment, from two cut-off phones. What merge rule do you want?',
          choices: [
            { label: 'Keep both edits and merge the lists (set-like CRDT or siblings)', score: 2, effects: { 'correctness': 20 }, feedback: 'Both people’s items survive. A list of items has a natural merge: take the union.' },
            { label: 'Last write wins: the later list replaces the earlier one', score: 0, effects: { 'correctness': -25 }, feedback: 'One person’s edits vanish, silently. They find out when they are at the shop.' },
            { label: 'Reject the second edit with an error', score: 1, effects: { 'correctness': 5, 'speed': -10 }, feedback: 'Nothing is lost, but users get an annoying error for a perfectly ordinary action.' }
          ] }
      ],
      outro: 'The dial is set **per kind of data**: loose and fast where staleness is harmless, strict where it costs money.' },

    { type: 'explain', prompt: 'Explain what a quorum is and why "R + W > N" means a read cannot completely miss the latest write.',
      model: 'With N copies, a write must be confirmed by W of them and a read asks R of them. If R + W is more than N, the group of copies that took the write and the group the read asks must share at least one copy. That shared copy has the latest write, so the read will see it and can pick the newest value.',
      keywords: ['N copies', 'write', 'read', 'overlap', 'at least one', 'latest', 'R + W'] }
  ],

  flashcards: [
    { q: 'Strong vs eventual consistency?', a: 'Strong: every read returns the latest write. Eventual: if writes stop, all copies converge, but reads in the meantime can be stale.' },
    { q: 'What do read-your-writes and monotonic reads each promise?', a: 'Read-your-writes: you always see your own changes. Monotonic reads: once you have seen a value, you never see an older one.' },
    { q: 'What is the quorum rule and what does it guarantee?', a: 'With N copies, a write goes to W and a read asks R. If R + W > N, the read set overlaps the write set, so a read sees the latest write.' },
    { q: 'Last-write-wins: what is its weakness?', a: 'It discards the losing write silently and depends on clocks that are not perfectly synchronised across machines.' },
    { q: 'What is a CRDT?', a: 'A conflict-free replicated data type: a structure (counter, set, text) designed so replicas can always be merged automatically and converge to the same result.' }
  ],

  glossary: [
    { term: 'Eventual consistency', def: 'A promise that if no new writes arrive, all copies will eventually hold the same value. Meanwhile reads may be stale.', like: 'News spreading through a village.' },
    { term: 'Quorum', def: 'The minimum number of copies that must agree for a read or write to count. With R + W > N, reads overlap writes.', like: 'A vote that needs a majority present.' },
    { term: 'Last write wins', def: 'A conflict rule that keeps the version with the highest timestamp and discards the other.', aka: ['LWW'] },
    { term: 'Vector clock', def: 'A set of per-machine counters attached to a version that lets the system tell whether two versions are ordered or concurrent.', like: 'Each person initialling the pages they have read, so you can see who has seen what.' },
    { term: 'CRDT', def: 'A data type built so concurrent updates on different replicas can always be merged automatically, with the same final result in any order.', aka: ['conflict-free replicated data type'] }
  ],

  takeaways: [
    'Consistency is a **dial**: strong, eventual, and promises in between like **read-your-writes** and **monotonic reads**.',
    '**Quorums**: with N copies, **R + W > N** makes every read overlap the latest write.',
    '**Last write wins** is simple but loses data and trusts clocks.',
    '**Vector clocks** detect concurrent writes; **CRDTs** merge themselves. Choose the rule per kind of data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sd-distributed-tx', {
  eli5: 'When one action spans several separate systems, one normal transaction cannot cover it. Sagas chain small steps, each with an undo, while idempotency keys and an outbox stop repeats and lost messages.',

  cards: [
    { kind: 'concept', title: 'One click, three services',
      body: `A customer taps **Place order**. Behind the scenes, three different services must act: **Payments** charges the card, **Inventory** reserves the stock, **Shipping** books a courier. Each service owns its own database.

        On a single database you would wrap this in one **transaction** (from *Relational Databases*): all steps succeed or none do. The database does the hard work.

        But there is no transaction that spans three databases owned by three teams, running on different machines. What if payment succeeds, then inventory says "out of stock"? The customer has been charged for nothing.

        This lesson is about getting several systems to **agree, or undo**.` },

    { kind: 'metaphor', title: 'Booking a holiday from three companies',
      body: `You are booking a trip: a flight with one company, a hotel with another and a hire car with a third. You cannot ask them to join a shared "all or nothing" button, because they do not know each other.

        Two approaches come to mind:

        - **Ask everyone to hold it, then confirm.** Ring each one, "can you hold this for me?", and only when all say yes, tell them all to book. (Two-phase commit.)
        - **Book step by step, and cancel if something fails.** Book the flight, then the hotel. If the car is unavailable, cancel the hotel and the flight, probably paying a small fee. (A saga.)

        Both work. They fail in very different ways.` },

    { kind: 'sequence', title: 'Two-phase commit (2PC)',
      body: 'A **coordinator** asks everyone to prepare, then tells them all to commit. Step through it.',
      actors: ['Coordinator', 'Payments', 'Inventory'],
      steps: [
        { from: 0, to: 1, label: 'prepare: charge £30?', note: '**Phase 1, the vote.** The coordinator asks each participant whether it can commit.' },
        { from: 0, to: 2, label: 'prepare: reserve item?', note: 'Each participant does all the work it can, **locks** the rows it touched, and promises to commit if told to.' },
        { from: 1, to: 0, label: 'yes', dashed: true, note: 'Voting yes is a binding promise: "I will be able to commit, whatever happens next."' },
        { from: 2, to: 0, label: 'yes', dashed: true, note: 'If anyone had voted **no**, the coordinator would tell everyone to abort.' },
        { from: 0, to: 1, label: 'commit', note: '**Phase 2, the decision.** All voted yes, so the coordinator tells everyone to commit and the locks are released.' },
        { from: 0, to: 2, label: 'commit', note: 'The result is true atomicity: all or nothing, at the same moment.' }
      ] },

    { kind: 'pitfall', title: 'The blocking problem with 2PC',
      body: `2PC gives you strong guarantees, and a nasty weakness. Imagine the coordinator **crashes right after the participants voted yes** but before it sent the decision.

        Each participant has promised to commit, is holding **locks** on its rows, and cannot decide alone. It does not know whether the others committed or aborted. It must wait for the coordinator to return. Meanwhile other requests that touch those rows are **blocked**.

        Other costs: it is slow (several round trips, with locks held throughout), every participant must support the protocol, and any one slow participant slows everyone.

        So 2PC is used inside some databases and between a few tightly coupled systems, but rarely across independent microservices.` },

    { kind: 'concept', title: 'Sagas: a chain of small transactions with undo buttons',
      body: `A **saga** takes a different view: don't hold locks across services. Split the big job into **local transactions**, each committed in its own service straight away, in order.

        For every step, you also write a **compensating action**: a step that **semantically undoes** it.

        - Charge the card → *refund the card*
        - Reserve stock → *release the stock*
        - Book courier → *cancel the booking*

        If step 3 fails, the saga runs the compensations for steps 2 and 1, in reverse. No long locks, so it scales; but there is a price: in the middle of a saga, the world is in a **half-done state** that other users can see (money charged, stock not yet reserved). Sagas give you *eventual* atomicity, not instant.` },

    { kind: 'sequence', title: 'A saga that fails and compensates',
      body: 'An orchestrator runs the steps. The stock turns out to be gone. Step through.',
      actors: ['Orchestrator', 'Payments', 'Inventory'],
      steps: [
        { from: 0, to: 1, label: 'charge £30', note: 'Step 1 is a normal local transaction in Payments. It commits immediately.' },
        { from: 1, to: 0, label: 'charged', dashed: true, note: 'The customer’s card has been charged. The saga is now half-done.' },
        { from: 0, to: 2, label: 'reserve item', note: 'Step 2: reserve the stock.' },
        { from: 2, to: 0, label: 'FAILED: out of stock', dashed: true, note: 'The step fails. There is no "rollback" button across services.' },
        { from: 0, to: 1, label: 'refund £30 (compensate)', note: 'Instead, the orchestrator runs the **undo** of step 1: a *new* action that refunds the card.' },
        { note: 'Compensation is a business action, not magic. It can be visible (the customer sees a charge and a refund) and some steps cannot be undone at all (an email already sent). Design those steps **last**. In the lab that follows, you will inject failures and watch the compensations.' }
      ],
      note: 'Two ways to run a saga: an **orchestrator** tells each service what to do (above); or services react to each other’s events with no central boss (**choreography**).' },

    { kind: 'code', title: 'Idempotency keys: safe to repeat',
      body: 'Sagas and message queues retry things, and retries mean duplicates. Remember idempotency from the HTTP lesson. The same trick protects each step.',
      code: { lang: 'js', src: `
        async function charge(req) {
          const { key, amount, card } = req;
          const done = await db.get('payments', { key });
          if (done) return done.result;          // replay, don't re-charge

          const result = await bank.charge(card, amount);
          await db.insert('payments', { key, result });
          return result;
        }`,
        notes: {
          3: 'Look the key up first. If we have seen this exact request, return the **stored answer** instead of doing the work again.',
          6: 'Do the real work only once per key.',
          7: 'Store the result under the key. (In real code, the key check and this insert must be atomic, for example a unique constraint, so two simultaneous retries cannot both slip through.)'
        } },
      note: 'The key is generated by the caller once per intended action, and re-sent unchanged on every retry.' },

    { kind: 'pitfall', title: 'The dual-write problem',
      body: `Here is a bug that looks innocent. After saving an order, a service must also tell the others by publishing an **event** ("OrderPlaced") to a message queue.

        \`\`\`js
        await db.insert('orders', order);   // step 1
        await queue.publish('OrderPlaced'); // step 2
        \`\`\`

        Two different systems, no shared transaction. If the service **crashes between the two lines**, the order is saved but nobody ever hears about it: no payment, no shipping. Swap the lines and you can announce an order that was never saved.

        You cannot make two separate systems update atomically. The fix is to make it **one** update, then forward it.` },

    { kind: 'diagram', title: 'The outbox pattern',
      body: 'Save the event **in the same database transaction** as the data, then let a separate process deliver it.',
      nodes: [
        { id: 'svc', label: 'Order service', icon: '🖥️', x: 1, y: 0 },
        { id: 'db', label: 'Database: orders + outbox', icon: '🗄️', x: 1, y: 1, tone: 'accent' },
        { id: 'relay', label: 'Relay process', icon: '📮', x: 1, y: 2, tone: 'info' },
        { id: 'q', label: 'Message queue', icon: '📨', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'svc', to: 'db', label: 'one transaction' },
        { from: 'relay', to: 'db', label: 'read new rows', dashed: true },
        { from: 'relay', to: 'q', label: 'publish' }
      ],
      caption: 'The order row and its outbox row commit together, or neither does. The relay then publishes at least once, marking rows as sent.' },

    { kind: 'tip', title: 'What to remember, and what to reach for',
      body: `If the relay crashes after publishing but before marking the row as sent, it publishes again. The outbox gives **at-least-once** delivery, never lost, sometimes repeated. So consumers must be **idempotent**, with the idempotency key above. The two ideas fit together.

        A practical menu:

        - **Can it live in one database?** Then use a normal transaction. Simplest by far.
        - **Several services, work can be undone?** A saga, with idempotent steps and an outbox for reliable events.
        - **Must be instantly all-or-nothing across a few systems?** Consider 2PC, with open eyes about blocking.

        And the real first question: **should these two things really be in separate services?**` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'In two-phase commit, a participant has voted "yes" and is holding locks when the coordinator crashes. What is its problem?',
      options: ['It cannot decide alone, so it waits holding locks, blocking others', 'It automatically commits, which might be wrong', 'It automatically rolls back, which might be wrong', 'Nothing: it forgets the transaction'],
      answer: 0,
      why: [null, 'Committing alone could contradict a decision to abort, so it must not.', 'Aborting alone could contradict a decision to commit.', 'It made a binding promise when it voted yes, so it cannot forget.'],
      explain: 'After voting yes, the participant has promised to go either way and does not know which. Until the coordinator is back, its locks stay held. That is the blocking problem.' },

    { type: 'match', after: 4, prompt: 'Match each saga step with its compensating action.',
      pairs: [['Charge the card', 'Refund the card'], ['Reserve the stock', 'Release the stock'], ['Create the shipment', 'Cancel the shipment'], ['Create the order', 'Mark the order cancelled'], ['Send the confirmation email', 'Cannot be undone: send last']],
      explain: 'A compensation is a new action that reverses the effect in business terms. Some actions have none, which is why such steps go last in the saga.' },

    { type: 'tf', statement: 'A saga holds database locks across all of its services until the whole saga is finished, just like 2PC.', answer: false,
      explain: 'Each saga step commits as a local transaction straight away. That is why sagas scale better, and why outsiders can see half-done states in between.' },

    { type: 'spot', prompt: 'This service publishes an event after saving. Tap the line that makes it unsafe.',
      code: { lang: 'js', src: `
        async function placeOrder(order) {
          await db.insert('orders', order);
          await queue.publish('OrderPlaced', order);
          return order.id;
        }` },
      lines: [3],
      explain: 'The save and the publish are two separate systems with no shared transaction. A crash between lines 2 and 3 saves the order but loses the event. The outbox pattern stores the event in the same transaction as the order.' },

    { type: 'order', prompt: 'Put the outbox pattern in order.',
      items: ['The service saves the order and an outbox row in one transaction', 'A relay process reads unsent outbox rows', 'The relay publishes each event to the message queue', 'The relay marks the row as sent', 'Consumers handle the event, tolerating duplicates'],
      explain: 'The atomic save comes first, and everything after it can safely retry. Because the relay may publish twice, consumers have to be idempotent.' },

    { type: 'ab', q: 'A payment endpoint is retried by the client after a timeout. Which version avoids a double charge?',
      a: { lang: 'js', label: 'Check the key', src: `
        const seen = await db.get('payments', { key: req.key });
        if (seen) return seen.result;
        const result = await bank.charge(req.card, req.amount);
        await db.insert('payments', { key: req.key, result });
        return result;` },
      b: { lang: 'js', label: 'Charge on every call', src: `
        const result = await bank.charge(req.card, req.amount);
        await db.insert('payments', { result });
        return result;` },
      answer: 'a',
      explain: 'Checking for the key first means the second attempt returns the stored result instead of calling the bank again. Without it, each retry is a brand-new payment.' },

    { type: 'bucket', prompt: 'Is this a trait of two-phase commit or of a saga?', buckets: ['Two-phase commit', 'Saga'],
      items: [['Locks are held across services until the decision', 0], ['Each step commits straight away', 1], ['Failure is handled by compensating actions', 1], ['A coordinator crash can leave participants blocked', 0], ['Other users can see intermediate half-done states', 1], ['Gives all-or-nothing at one moment in time', 0]],
      explain: '2PC buys true atomicity at the price of locks and blocking. Sagas drop the locks, accept visible intermediate states, and rely on undo steps.' },

    { type: 'scenario', title: 'The order that half-happened', intro: 'You lead the backend of a shop with Payments, Inventory and Shipping services. A customer was charged but never got a parcel, and nobody knows why. Time to design it properly.',
      meters: { 'customer trust': 50, 'reliability': 40, 'simplicity': 60 },
      steps: [
        { text: 'First: how should the three steps be coordinated?',
          choices: [
            { label: 'A saga: local steps with a compensating action for each (refund, release, cancel)', score: 2, effects: { 'reliability': 25, 'simplicity': -10 }, feedback: 'No cross-service locks, and every failure has a defined way back. The right default for independent services.' },
            { label: 'Two-phase commit across all three databases', score: 1, effects: { 'reliability': 10, 'simplicity': -25 }, feedback: 'It can work, but it needs every service to support it, holds locks across services, and a coordinator crash can block everyone.' },
            { label: 'Call them one after another and hope for the best', score: 0, effects: { 'customer trust': -20, 'reliability': -20 }, feedback: 'This is how you got here. Any failure mid-way leaves a half-done order nobody cleans up.' }
          ] },
        { text: 'In testing, a timeout makes the payment step run twice for some orders. How do you fix it?',
          choices: [
            { label: 'Send an idempotency key with each charge so repeats return the first result', score: 2, effects: { 'customer trust': 25, 'reliability': 15 }, feedback: 'Retries become harmless. Same key, same stored answer, one charge.' },
            { label: 'Turn off all retries', score: 0, effects: { 'reliability': -25 }, feedback: 'Now every network blip is a failed order, and you still do not know what happened to those in flight.' },
            { label: 'Make the timeout longer', score: 1, effects: { 'reliability': 5 }, feedback: 'Fewer timeouts, but the failure is rarer, not gone. A long timeout also makes customers wait.' }
          ] },
        { text: 'The Order service saves the order, then publishes "OrderPlaced". Occasionally the pod is killed in between and shipping never hears. What do you do?',
          choices: [
            { label: 'Write the event to an outbox table in the same transaction; a relay publishes it', score: 2, effects: { 'reliability': 30, 'simplicity': -10 }, feedback: 'The event can no longer be lost: it commits with the order. The relay may duplicate, and your idempotent consumers absorb that.' },
            { label: 'Publish first, then save', score: 0, effects: { 'reliability': -15, 'customer trust': -15 }, feedback: 'You swap one failure for another: events for orders that were never saved.' },
            { label: 'Run a nightly job that finds orders without events', score: 1, effects: { 'reliability': 10 }, feedback: 'A reasonable safety net, but customers wait until tomorrow. The outbox removes the gap.' }
          ] }
      ],
      outro: 'The toolkit: **sagas for coordination, idempotency keys for repeats, the outbox for reliable events.**' },

    { type: 'explain', prompt: 'A colleague asks: "Why not just use a database transaction across Payments, Inventory and Shipping?" Explain in your own words, and what you would do instead.',
      model: 'Each service has its own database on its own machine, so there is no single transaction that covers them. A distributed transaction like two-phase commit exists but is slow, holds locks across services and can block if the coordinator crashes. Instead I would use a saga: each service commits its own step, and if a later step fails, compensating actions such as refunds undo the earlier ones. I would add idempotency keys so retries are harmless, and an outbox so events are not lost.',
      keywords: ['own database', 'two-phase commit', 'locks', 'blocking', 'saga', 'compensating', 'idempotency', 'outbox'] }
  ],

  flashcards: [
    { q: 'Why can one normal transaction not span several microservices?', a: 'Each service owns its own database on its own machine, so no single database can make all their changes atomic.' },
    { q: 'How does two-phase commit work, and what is its main problem?', a: 'Phase 1: the coordinator asks everyone to prepare and vote. Phase 2: if all say yes it tells them to commit. If the coordinator crashes in between, participants hold locks and block.' },
    { q: 'What is a saga and what is a compensating action?', a: 'A saga is a chain of local transactions. A compensating action is a new step that undoes an earlier one in business terms (refund, release stock).' },
    { q: 'What does an idempotency key do?', a: 'It lets a service recognise a repeated request and return the earlier result instead of repeating the work.' },
    { q: 'What problem does the outbox pattern solve?', a: 'The dual write: saving data and publishing an event are two systems. The outbox stores the event in the same database transaction, and a relay publishes it later, at least once.' }
  ],

  glossary: [
    { term: 'Distributed transaction', def: 'A transaction whose steps happen in several separate systems, which must all commit or all abort.' },
    { term: 'Two-phase commit', def: 'A protocol where a coordinator asks all participants to prepare, then tells them to commit if all agree. Strong, but can block when the coordinator fails.', aka: ['2PC'], like: 'Asking everyone "are you in?" before telling them all "go".' },
    { term: 'Saga', def: 'A long job split into local transactions, each with a compensating action to undo it if a later step fails.', like: 'Booking a trip step by step and cancelling bookings if something falls through.' },
    { term: 'Compensating action', def: 'A new action that reverses the effect of an earlier step, such as a refund after a charge.' },
    { term: 'Outbox pattern', def: 'Saving an event to an outbox table in the same transaction as the data change, then publishing it with a separate relay. Prevents lost events.', like: 'Putting the letter in the out-tray on your desk, so the postman picks it up even if you go home sick.' }
  ],

  takeaways: [
    'A single transaction cannot cover **separate services with separate databases**.',
    '**2PC** gives true atomicity but holds locks and **blocks** if the coordinator dies.',
    '**Sagas** commit step by step and use **compensating actions** to undo; half-done states are visible meanwhile.',
    '**Idempotency keys** make retries safe; the **outbox** makes "save and announce" atomic. Use both together.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('scaling-data', {
  title: 'The Many-Headed Hydra',
  intro: 'Cut off one copy of the data and two more grow back, each with its own opinion. Beat the hydra by choosing the right lever, reading the trade-offs and knowing what survives a crash.',
  questions: [
    { type: 'mcq', q: 'Your database is at 90% CPU. Measurements show 97% of queries are reads, mostly for the same popular items. Which step is the best fit?',
      options: ['A cache for popular reads, then read replicas if needed', 'Shard the database by customer ID', 'Switch to synchronous replication', 'Move to multiple leaders in several regions'],
      answer: 0,
      why: [null, 'Sharding mainly helps write volume and data size, neither of which is the problem here.', 'Synchronous replication makes writes slower and does not reduce read load.', 'Multi-leader adds conflict handling for a problem that was never about writes.'],
      explain: 'The load is read-heavy and repetitive, which is exactly what caches and replicas absorb cheaply. Sharding is the last, most complex rung.' },

    { type: 'tf', statement: 'With asynchronous replication, a follower can briefly serve data older than what the leader has already confirmed to a client.', answer: true,
      explain: 'That gap is replication lag. It is the price of the leader replying without waiting for followers.' },

    { type: 'mcq', q: 'A user posts a comment and instantly reloads, but the comment is missing. Later it appears. What is the most direct fix?',
      options: ['Read-your-writes: send that user’s reads to the leader briefly after they write', 'Buy faster disks so that every follower can read data back sooner', 'Add a second leader in the same region so writes are shared out', 'Show a message asking the user to wait a minute and then refresh'],
      answer: 0,
      why: [null, 'Speed of disk is not the issue; the follower has not received the change yet.', 'A second leader introduces write conflicts and does not fix lag.', 'It hides the problem rather than fixing it.'],
      explain: 'The read hit a lagging follower. Routing the author’s own reads to a caught-up copy for a short time guarantees they see their change.' },

    { type: 'cloze', text: 'In sharding, the {{shard key}} decides where a record lives. Range keys risk {{hot spots}}; hashing spreads load evenly, but {{consistent hashing}} is what lets you add a machine while moving only about 1 in N keys.',
      distractors: ['quorum', 'two-phase commit', 'replica'],
      explain: 'These are the three core sharding ideas: the key, the hot-spot risk, and the ring that makes adding capacity cheap.' },

    { type: 'estimate', q: 'You use hash-mod-N across 4 shards and add a 5th. Roughly what percentage of keys move?',
      answer: 80, unit: '% of keys', min: 1, max: 100, tolerance: 1.2,
      explain: 'Adding one shard to N moves about N out of N+1 keys: 4 out of 5, or 80%. Consistent hashing would move about 20%.' },

    { type: 'multi', q: 'Which statements about the CAP theorem are correct?',
      options: ['The choice between consistency and availability only arises during a network partition', 'You can choose to give up partition tolerance in a distributed system', 'A CP system may refuse some requests during a partition', 'Availability in CAP means the same as high uptime', 'An AP system may return stale data'],
      answers: [0, 2, 4],
      explain: 'Partitions are unavoidable, so the real choice is C or A, and only during one. CAP availability is "every working node answers", which is narrower than uptime.' },

    { type: 'bucket', prompt: 'Lean CP or lean AP when the network splits?', buckets: ['CP: refuse rather than be wrong', 'AP: answer even if stale'],
      items: [['Charging a customer’s card', 0], ['Showing a view counter', 1], ['Choosing which server is leader', 0], ['Loading someone’s feed', 1], ['Reserving the last seat on a flight', 0], ['Adding to a wish-list', 1]],
      explain: 'Where a wrong answer costs money or breaks uniqueness, a short refusal is cheaper. Where staleness is harmless and merging is easy, stay available.' },

    { type: 'short', q: 'With N = 3 and R = 2, what is the smallest write quorum W that guarantees reads see the latest write? (a number)', accept: ['2', 'two'], hint: 'R + W must be greater than N.',
      explain: 'R + W > 3 with R = 2 means W must be at least 2. W = 1 gives a sum of 3, which is not strictly greater.' },

    { type: 'ab', q: 'Two phones edit the same shared shopping list while offline. Which merge strategy is better?',
      a: { lang: 'js', label: 'Union of both lists', src: `
        function merge(listA, listB) {
          return Array.from(new Set([...listA, ...listB]));
        }` },
      b: { lang: 'js', label: 'Newest timestamp wins', src: `
        function merge(listA, listB) {
          return listA.updatedAt > listB.updatedAt ? listA : listB;
        }` },
      answer: 'a',
      explain: 'Both people’s additions matter, so merging keeps them. Last-write-wins silently discards one whole list, and its "newest" depends on unreliable clocks.' },

    { type: 'match', prompt: 'Match each idea to what it means.',
      pairs: [['Split brain', 'Two machines both act as leader'], ['PACELC "else" half', 'Latency versus consistency when healthy'], ['Vector clock', 'Detects whether writes were concurrent'], ['Outbox pattern', 'Event saved in the same transaction as the data'], ['Compensating action', 'A new step that undoes an earlier one']],
      explain: 'Each is the standard answer to a particular distributed problem: dual leaders, the cost of consistency, conflict detection, lost events and cross-service undo.' },

    { type: 'order', prompt: 'A saga runs Charge, Reserve stock, Book courier. The courier step fails. Put what happens next in order.',
      items: ['Charge the card (commits at once)', 'Reserve the stock (commits at once)', 'Booking the courier fails', 'Release the stock (compensate step 2)', 'Refund the card (compensate step 1)'],
      explain: 'Earlier steps already committed, so they cannot be rolled back. Compensations run in reverse order of the original steps.' },

    { type: 'spot', prompt: 'A payment retry handler must avoid double charges. Tap the line that breaks that.',
      code: { lang: 'js', src: `
        async function pay(req) {
          const done = await db.get('payments', { key: req.key });
          if (done) return done.result;
          const result = await bank.charge(req.card, req.amount);
          await bank.charge(req.card, req.amount);
          await db.insert('payments', { key: req.key, result });
          return result;
        }` },
      lines: [5],
      explain: 'Line 5 charges the card a second time before the result is stored. The key check on lines 2 and 3 only helps if the real work happens exactly once.' }
  ]
});

KS.sheet('scaling-data', {
  title: 'Scaling Data: cheat sheet',
  sections: [
    { title: 'The scaling ladder',
      md: `Climb in this order, only when numbers force you:

        1. Fix slow queries, add **indexes**
        2. **Scale up** (bigger machine)
        3. **Cache** repeated reads
        4. **Read replicas** (more read capacity)
        5. **Shard** (spread data and writes)

        **Read-heavy** load is easy to copy; **write-heavy** load must be agreed in one place. Going distributed costs you easy transactions and joins, instant agreement and simple failures.` },

    { title: 'Replication',
      md: `| Setup | Writes go to | Watch for |
        |---|---|---|
        | Single leader | One leader | Lag, failover |
        | Multi-leader | Several leaders | Write conflicts |
        | Leaderless | Any node (quorum) | Stale reads, repair |

        **Async**: fast, recent writes can be lost. **Sync**: safe, slow. **Semi-sync**: wait for one follower.
        **Lag** causes stale reads; fix with **read-your-writes**. **Split brain** = two leaders; prevent with majority votes and fencing.` },

    { title: 'Sharding',
      md: `| Method | Strength | Weakness |
        |---|---|---|
        | Range | Range scans | Hot ranges |
        | Hash | Even spread | No range scans |
        | Directory | Flexible | Lookup table to protect |

        **Good shard key:** many values, even traffic, in most queries. **Hot spots:** timestamps, celebrities, low-variety keys.
        Hash-mod-N moves about N of N+1 keys when adding a node; **consistent hashing** moves about 1 in N+1 (use virtual nodes). Cross-shard queries and joins are costly.` },

    { title: 'CAP and PACELC',
      md: `**C**onsistent: reads see the latest write. **A**vailable: every working node answers. **P**artition tolerance: survives lost messages.

        - Partitions will happen, so the choice is **C or A, only during a partition**.
        - **CP:** refuse rather than be wrong (etcd, ZooKeeper, Consul).
        - **AP:** answer, maybe stale (Cassandra, DynamoDB, CouchDB by default).
        - **PACELC:** if Partition, A or C; Else, **L**atency or **C**onsistency.

        Not "pick two". Decide per feature.` },

    { title: 'Consistency and conflicts',
      md: `**Strong** = always latest. **Eventual** = converges if writes stop.
        **Read-your-writes** = you see your changes. **Monotonic reads** = never older than before.

        **Quorum:** N copies, write to W, read from R. **R + W > N** means reads overlap the latest write. (N = 3: W = 2, R = 2 works; 1 and 1 does not.)

        | Conflict rule | Catch |
        |---|---|
        | Last write wins | Loses data, trusts clocks |
        | Vector clocks | Detect concurrency, app merges |
        | CRDTs | Auto-merge, suits counters, sets |` },

    { title: 'Distributed transactions',
      md: `| Approach | Idea | Weakness |
        |---|---|---|
        | **2PC** | Prepare, vote, then commit | Locks held; blocks if coordinator dies |
        | **Saga** | Local steps plus compensating undo | Half-done states visible |

        **Idempotency key:** same key, same result, so retries are safe.
        **Outbox:** write the event in the same transaction as the data; a relay publishes it (at least once, so consumers must be idempotent).
        First ask: can it live in **one** database?` }
  ]
});
