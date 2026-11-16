/* Module: messaging — Messaging & Event Streaming.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs messaging */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('mq-why', {
  eli5: 'A message queue is a waiting line for jobs. One program drops a job in and carries on; another picks it up when it is ready. Neither has to be awake or fast at the same moment as the other.',

  cards: [
    { kind: 'concept', title: 'The checkout that waits for the email',
      body: `A customer clicks **Pay**. Your server has to take the payment, then send a confirmation email, then tell the warehouse, then update the loyalty points.

        The simple way is to do them **one after another, in the same request**, calling each service directly and waiting for each to finish.

        Now the email service is having a bad afternoon and takes 20 seconds to answer. The customer stares at a spinner. Worse, it fails outright and your server returns an error, *even though the money was taken*.

        Your checkout has become **only as reliable and as fast as its slowest, flakiest dependency**. The two systems are tied together: both must be up, and quick, at the same instant.` },

    { kind: 'metaphor', title: 'The order rail in a restaurant kitchen',
      body: `In a busy kitchen the waiter does not stand next to the chef waiting for each dish. They **clip the order slip onto a rail** and walk away to serve the next table.

        The chef takes slips from the rail in turn, when they are free. If twenty tables order at once, the rail fills up, but nobody shouts and nothing is lost. The slips wait. If the chef steps out for a moment, the slips are still there.

        That rail is a **message queue**: a place where one side leaves a note and the other side collects it later. The waiter and the chef never have to be in sync.

        Where the metaphor stops: a real broker can hold millions of slips, keep them safe on disk and hand them to many chefs.` },

    { kind: 'sequence', title: 'Dropping a job, and surviving a crash',
      body: 'The same checkout, with a queue in the middle. Step through it.',
      actors: ['Shop', 'Queue', 'Email worker'],
      steps: [
        { from: 0, to: 1, label: 'send “order 42 confirmed”', note: 'After taking payment, the shop puts a **message** on the queue. This takes a few milliseconds.' },
        { from: 1, to: 0, label: 'stored OK', dashed: true, note: 'The queue confirms it has the message safely. The shop can tell the customer "done" **right now**.' },
        { note: 'Meanwhile the email worker has crashed. In the old design the checkout would have failed. Here, nobody notices.' },
        { from: 2, to: 1, label: 'ready for work', note: 'The worker restarts and asks the queue for a job.' },
        { from: 1, to: 2, label: 'deliver “order 42 confirmed”', dashed: true, note: 'The message was waiting all along. The queue hands it over, but **keeps its copy** for now.' },
        { at: 2, label: 'sends the email', note: 'The worker does the slow part.' },
        { from: 2, to: 1, label: 'done (acknowledge)', note: 'Only when the worker says it finished does the queue delete the message. If it had crashed again first, the queue would hand the message to someone else: **nothing lost**.' }
      ] },

    { kind: 'diagram', title: 'Producers, brokers and consumers',
      body: 'Three roles. They give you the vocabulary for everything in this module.',
      nodes: [
        { id: 'p1', label: 'Producer: checkout', icon: '🛒', x: 0, y: 0 },
        { id: 'p2', label: 'Producer: sign-up', icon: '📝', x: 0, y: 2 },
        { id: 'q', label: 'Broker with a queue', icon: '📬', x: 1, y: 1, tone: 'accent' },
        { id: 'c1', label: 'Consumer: emailer', icon: '✉️', x: 2, y: 0 },
        { id: 'c2', label: 'Consumer: emailer', icon: '✉️', x: 2, y: 2 }
      ],
      edges: [
        { from: 'p1', to: 'q', label: 'publish' },
        { from: 'p2', to: 'q', label: 'publish' },
        { from: 'q', to: 'c1', label: 'deliver', dashed: true },
        { from: 'q', to: 'c2', dashed: true }
      ],
      caption: 'A producer creates messages. The broker stores and delivers them. A consumer receives and does the work.',
      note: 'A **message** is just a small piece of data describing a job or an event, often JSON, such as the order id and the customer’s email.' },

    { kind: 'concept', title: 'Benefit one: decoupling in time',
      body: `The queue breaks the link **in time**. The producer and the consumer no longer need to be running, or fast, together.

        - The email service can be **down for maintenance** and the shop keeps taking orders.
        - A new feature can be **added later** with another consumer; the shop does not change.
        - The producer does not need to know who consumes. It just says "this happened".

        Compare with calling an API directly. That is a phone call: both must be free at once. A queue is a **voicemail**: leave the message, hang up, they listen when ready.

        The price is that the answer is no longer immediate. The producer cannot say "the email has been sent", only "the email is *going* to be sent".` },

    { kind: 'concept', title: 'Benefit two: soaking up spikes',
      body: `Traffic is rarely smooth. A sale starts, a newsletter lands, a concert goes on sale: suddenly there are far more jobs than workers can do at once.

        Without a queue the extra work **overwhelms** the workers: they slow down, time out, fall over. With a queue the extra jobs simply **wait their turn**. The workers carry on at their normal pace and the pile drains once the rush is over. This is called **load levelling**.

        | Minute | Arriving | Processed | Waiting |
        |---|---|---|---|
        | 1 | 500 | 200 | 300 |
        | 2 | 500 | 200 | 600 |
        | 3 | 500 | 200 | 900 |
        | 4 | 50 | 200 | 750 |
        | 8 | 50 | 200 | 150 |
        | 9 | 50 | 200 | 0 |

        The workers never ran faster. The queue just spread the spike out in time.`,
      note: 'In the lab that follows you will cause a backlog yourself, then add consumers and watch it drain.' },

    { kind: 'code', title: 'What using a queue looks like',
      body: 'This uses a made-up library to show the shape. Real ones differ in detail but do the same things. **Tap the lines.**',
      code: { lang: 'js', src: `
        // producer (in the shop's checkout)
        await queue.publish('emails', {
          type: 'order-confirmed',
          orderId: 42
        });

        // consumer (a separate program)
        queue.consume('emails', async (msg) => {
          await sendEmail(msg.orderId);
          msg.ack();
        });`,
        notes: {
          2: 'Publish to a named queue and **carry on**. Nothing here waits for the email to be sent.',
          3: 'The message is plain data. Keep it small: ids and facts rather than whole documents.',
          8: 'The consumer is a **different program**, maybe on a different machine, maybe started an hour later. It just names the queue it wants jobs from.',
          9: 'The slow, risky work happens here, away from the customer’s request.',
          10: '**Acknowledge** means "I finished, you can delete it". Until then the broker still holds the message, which is how crashes do not lose work.'
        } } },

    { kind: 'concept', title: 'Benefit three: retrying without losing work',
      body: `Services fail. A network blips; a database is briefly locked; a worker runs out of memory. When that happens halfway through a job you must not lose the job.

        A queue gives you a safety net **for free**. The message is stored until a consumer **acknowledges** it. If the consumer dies first, no acknowledgement arrives, and the broker offers the message to a worker again.

        Compare the alternative: your checkout calls the email service, it fails, and now the checkout code must decide whether to retry, how many times, and what to do if the server restarts and forgets. A queue holds that state for you.

        The lessons ahead cover acknowledgements, redelivery and their sharp edges in detail. For now: **the work is kept until someone says it is done**.` },

    { kind: 'pitfall', title: 'When a queue is the wrong tool',
      body: `Queues are not magic, and they are not free.

        - **The caller needs the answer now.** "What is in my basket?" "Is this username taken?" Someone is waiting on screen. Use a direct call.
        - **It is small and simple.** Two services and ten users do not need a broker to run, secure and watch.
        - **Order and certainty matter more than speed**, and you cannot afford the extra moving part.
        - **It makes problems harder to see.** A failure can happen minutes later in another program, so you need logging and monitoring to follow a job's life.

        Also remember the data is **eventually** done, not immediately. If the customer might read the page before the email exists, tell them "it is on its way".` },

    { kind: 'compare', title: 'Call directly or queue it?',
      body: 'A quick way to decide.',
      cols: ['Direct call', 'Queue'],
      rows: [
        ['Caller needs the result', '**Yes**: waits for the answer', 'No: carries on'],
        ['If the other side is down', 'Request fails', 'Message waits'],
        ['A sudden spike', 'Passes straight to the worker', 'Absorbed and drained'],
        ['Retries', 'Caller must write them', 'Built in, via redelivery'],
        ['Complexity', 'Lower', 'Higher: a broker to run and watch']
      ] }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'The email worker is down for ten minutes while customers keep checking out through a queue. What happens to the confirmation emails?',
      options: ['They wait in the queue and are sent when the worker returns', 'They are lost, because nobody was there to receive them', 'The checkout fails until the worker is back', 'The shop sends them itself, as a backup'],
      answer: 0,
      why: [null, 'The broker stores messages until someone consumes and acknowledges them.', 'That is the old design. The queue exists so that checkout no longer depends on the worker.', 'The shop does not know or care who consumes; that is the point of decoupling.'],
      explain: 'The queue decouples the two in time. Messages wait safely until a consumer is ready, so a worker outage becomes a delay, not a failure.' },

    { type: 'match', after: 3, prompt: 'Match each term to its role.',
      pairs: [['Producer', 'Creates a message and sends it'], ['Broker', 'Stores messages and hands them out'], ['Consumer', 'Receives a message and does the work'], ['Message', 'A small piece of data describing a job or event'], ['Acknowledge', 'Tells the broker the job is finished']] },

    { type: 'estimate', after: 4, q: 'A queue holds 1,200 waiting messages. Consumers process 100 per minute, while 20 new ones arrive every minute. About how many minutes until the queue is empty?',
      answer: 15, unit: 'minutes', tolerance: 2,
      explain: 'The backlog shrinks by (100 − 20) = **80 per minute**. 1,200 ÷ 80 = **15 minutes**. If arrivals ever matched processing speed, the backlog would never shrink: add consumers.' },

    { type: 'tf', statement: 'Adding a queue does not make any single job quicker to process.', answer: true,
      explain: 'True: each job takes just as long. What changes is that the producer does not wait, spikes are spread out, and failures do not lose work. The workers are not any quicker.' },

    { type: 'order', prompt: 'Put the life of one message in order.',
      items: ['The producer publishes the message to the broker', 'The broker stores it and confirms', 'A consumer receives the message', 'The consumer does the work', 'The consumer acknowledges and the broker deletes the message'],
      explain: 'The broker keeps its copy right up until the acknowledgement. That is what makes a crash during the work harmless.' },

    { type: 'bucket', prompt: 'Queue it, or call directly?', buckets: ['Good for a queue', 'Call directly'],
      items: [['Send a welcome email after sign-up', 0], ['Resize an uploaded photo into five sizes', 0], ['Generate a monthly PDF report', 0], ['Show the total of a basket right now', 1], ['Check whether a username is already taken, as the user types', 1], ['Verify a password at login', 1]],
      explain: 'Slow, can-wait, retry-friendly work suits a queue. When a person is waiting for the answer on screen, you need the result immediately, so call directly.' },

    { type: 'cloze', text: 'A {{producer}} puts messages on a queue held by a {{broker}}, and a {{consumer}} takes them off and does the work. A sudden spike is absorbed by the queue, which is called load {{levelling}}.',
      distractors: ['cache', 'router', 'sharding'],
      explain: 'Three roles and one benefit. Load levelling means the queue spreads a burst of work over time instead of crushing the workers.' },

    { type: 'scenario', title: 'The ticket rush', intro: 'You run a small ticketing site. A famous band announces a show and ten thousand people hit **Buy** within a minute. Each purchase needs a PDF ticket generated and emailed, and that service handles only a few per second.',
      meters: { 'customer trust': 50, 'system health': 70 },
      steps: [
        { text: 'The first rush is about to arrive. How should checkout deal with the PDFs?',
          choices: [
            { label: 'Confirm the purchase straight away and put a “make and email ticket” message on a queue', score: 2, effects: { 'customer trust': 15, 'system health': 10 }, feedback: 'Customers get instant confirmation, and the PDF service works through the jobs at its own steady pace. The spike is absorbed rather than crashing anything.' },
            { label: 'Make the checkout wait while each PDF is generated', score: 0, effects: { 'customer trust': -25, 'system health': -35 }, feedback: 'Ten thousand people wait on a service that handles a few per second. Pages time out, customers click Buy again, and the PDF service falls over.' },
            { label: 'Buy enough servers to make PDFs for everyone at once', score: 1, effects: { 'customer trust': 5, 'system health': -10 }, feedback: 'It would work, but you would pay for huge capacity that sits idle 99% of the time. A queue gets the same effect for far less.' }
          ] },
        { text: 'Twenty minutes in, the queue holds 6,000 messages, and customers are emailing asking where their tickets are. What now?',
          choices: [
            { label: 'Start extra consumers for now, and show “your tickets are on their way” on the confirmation page', score: 2, effects: { 'customer trust': 20, 'system health': 10 }, feedback: 'More consumers drain the backlog faster, and honest messaging tells people what to expect. Eventual delivery is fine when you say so.' },
            { label: 'Delete the oldest messages to shorten the queue', score: 0, effects: { 'customer trust': -40, 'system health': 5 }, feedback: 'You just threw away paid-for tickets. A queue is only safe if you never discard work you owe.' },
            { label: 'Switch the queue off and send tickets by hand', score: 0, effects: { 'customer trust': -20, 'system health': -20 }, feedback: 'Manual work at that scale is slow and error-prone, and the messages already queued would be stranded.' }
          ] },
        { text: 'A PDF worker runs out of memory and dies halfway through a ticket. The consumer had received that message but not yet acknowledged it. What should the system do?',
          choices: [
            { label: 'The broker notices there was no acknowledgement and gives the message to another worker', score: 2, effects: { 'customer trust': 15, 'system health': 10 }, feedback: 'This is the safety net: work is only deleted once someone says it is finished, so a crash simply means the job is tried again.' },
            { label: 'Acknowledge each message as soon as it is received, to keep the queue short', score: 0, effects: { 'customer trust': -30, 'system health': -10 }, feedback: 'Then a crash loses the ticket forever: the broker believes the job is done. Acknowledge only after the work succeeds.' },
            { label: 'Ask the customer to buy again', score: 0, effects: { 'customer trust': -40 }, feedback: 'The customer has paid. A retry from the queue is the whole point.' }
          ] }
      ],
      outro: 'The pattern: **accept the work fast, do it at your own pace, and delete a message only when the job is truly done.**' },

    { type: 'explain', prompt: 'A teammate says “a queue is just a slower way to call another service.” Explain what a queue gives you that a direct call does not.',
      model: 'A direct call needs both sides to be up and quick at the same moment, and the caller must wait. A queue decouples them in time: the producer drops a message and carries on, the broker stores it, and a consumer handles it when ready. That absorbs spikes (load levelling) and lets work be retried if a consumer fails, because the message is kept until it is acknowledged. The cost is that the result is not immediate.',
      keywords: ['decouple', 'time', 'store', 'spike', 'retry', 'acknowledge', 'not immediate'] }
  ],

  flashcards: [
    { q: 'What problem does a message queue solve?', a: 'It lets a producer hand work to a consumer without both being up and fast at the same time, so slow or failing services stop blocking the caller.' },
    { q: 'What do producer, broker and consumer mean?', a: 'The producer creates messages, the broker stores and delivers them, and the consumer receives them and does the work.' },
    { q: 'What is load levelling?', a: 'A queue absorbing a spike of work so consumers process it at a steady pace and the backlog drains afterwards.' },
    { q: 'How does a queue help with retries?', a: 'A message is kept until a consumer acknowledges it. If the consumer crashes first, the broker delivers the message again.' },
    { q: 'Name two situations where a queue is the wrong tool.', a: 'When the caller needs the answer immediately, and when the system is so small that running a broker is more trouble than it saves.' }
  ],

  glossary: [
    { term: 'Message queue', def: 'A store that holds messages in order between programs that send them and programs that process them.', like: 'The order rail in a kitchen.' },
    { term: 'Producer', def: 'The program that creates a message and sends it to the broker.', like: 'The waiter who clips the order slip on the rail.', aka: ['publisher', 'sender'] },
    { term: 'Consumer', def: 'The program that takes messages from the broker and does the work they describe.', like: 'The chef who takes slips off the rail.', aka: ['subscriber', 'worker'] },
    { term: 'Broker', def: 'The server that receives, stores and delivers messages between producers and consumers. RabbitMQ and Kafka are brokers.', like: 'The kitchen rail and the person looking after it.', aka: ['message broker'] },
    { term: 'Load levelling', def: 'Using a queue to absorb a burst of work so that workers handle it at a steady rate.', like: 'A queue at a bakery: the baker does not work faster, customers just wait their turn.' },
    { term: 'Acknowledgement', def: 'A message from a consumer to the broker saying a message has been fully handled, so it can be deleted.', like: 'Ticking the order off the list.', aka: ['ack'] }
  ],

  takeaways: [
    'A **queue** lets producers and consumers work at **different times and speeds**.',
    'It gives you **decoupling, spike absorption (load levelling) and retries**.',
    'The broker keeps a message until the consumer **acknowledges** it, so crashes do not lose work.',
    'Do **not** use a queue when the caller needs the answer now, or when the system is tiny.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('mq-patterns', {
  eli5: 'Messages can be delivered three ways: one worker takes each job (a queue), everyone interested gets a copy (publish and subscribe), or events are kept on a tape that anyone can rewind and replay (a stream).',

  cards: [
    { kind: 'concept', title: 'Who should get this message?',
      body: `A customer places an order. Your system now holds a message: "order 42 was placed". Who needs to hear it?

        - **Some jobs need exactly one worker.** "Generate the invoice PDF" should happen once. Two PDFs would be waste.
        - **Some events need many listeners.** The warehouse needs to pick, the email service needs to confirm, analytics needs to count, and fraud checking needs to look. All four must hear it.
        - **Some events need to be kept.** A new service launched next month may want to see last year's orders too.

        Three needs, three patterns: **point-to-point queues**, **publish/subscribe** and **event streams**. This lesson takes them in turn.` },

    { kind: 'metaphor', title: 'Tills in a supermarket',
      body: `A supermarket has one snaking line of shoppers and five tills. When a till frees up, the next shopper in line goes to it. No shopper is served twice, and if two tills are open the line moves twice as fast.

        That is a **point-to-point queue with competing consumers**. The consumers (tills) **compete** for messages (shoppers). Each message goes to **exactly one** of them.

        To go faster you simply open another till. You need no new rules and no changes to the shoppers.

        Where the metaphor stops: shoppers in a real line stay in order. When several consumers work at once, a later message may finish before an earlier one. We come back to ordering in a later lesson.` },

    { kind: 'diagram', title: 'Competing consumers',
      body: 'One queue, several workers. Each message is handled by exactly one of them.',
      nodes: [
        { id: 'p', label: 'Producer', icon: '🛒', x: 0, y: 1 },
        { id: 'q', label: 'Queue: invoices', icon: '📬', x: 1, y: 1, tone: 'accent' },
        { id: 'w1', label: 'Worker 1', icon: '⚙️', x: 2, y: 0 },
        { id: 'w2', label: 'Worker 2', icon: '⚙️', x: 2, y: 1 },
        { id: 'w3', label: 'Worker 3', icon: '⚙️', x: 2, y: 2 }
      ],
      edges: [
        { from: 'p', to: 'q', label: 'messages' },
        { from: 'q', to: 'w1', dashed: true },
        { from: 'q', to: 'w2', dashed: true },
        { from: 'q', to: 'w3', dashed: true }
      ],
      caption: 'Slow queue? Start another worker. This is the easiest way to scale a background job.' },

    { kind: 'diagram', title: 'Publish and subscribe: fan-out',
      body: `In **publish/subscribe** ("pub/sub") the producer does not send to a worker. It **announces** an event to a **topic**, and every subscriber gets **its own copy**. This is called **fan-out**, like a newsletter: you post once and every subscriber receives an issue.

        Adding a fifth interested service means adding a subscriber. The producer never changes and never even learns the new service exists.`,
      nodes: [
        { id: 'p', label: 'Checkout', icon: '🛒', x: 1, y: 0 },
        { id: 't', label: 'Topic: order placed', icon: '📣', x: 1, y: 1, tone: 'accent' },
        { id: 'e', label: 'Email service', icon: '✉️', x: 0, y: 3 },
        { id: 'w', label: 'Warehouse', icon: '📦', x: 1, y: 3 },
        { id: 'a', label: 'Analytics', icon: '📊', x: 2, y: 3 }
      ],
      edges: [
        { from: 'p', to: 't', label: 'publish once' },
        { from: 't', to: 'e', label: 'copy' },
        { from: 't', to: 'w', label: 'copy' },
        { from: 't', to: 'a', label: 'copy' }
      ],
      caption: 'Each subscriber has its own pile of messages, so a slow one never holds up the others.' },

    { kind: 'concept', title: 'Topics and routing',
      body: `Real systems have many kinds of event, and not every subscriber wants all of them. So events carry a **topic name**, or **routing key**, such as \`orders.placed\` or \`orders.cancelled\`, and subscribers say which they want.

        | Subscriber | Listens to |
        |---|---|
        | Warehouse | \`orders.placed\` |
        | Refund service | \`orders.cancelled\` |
        | Analytics | \`orders.*\` (every kind of order event) |

        The \`*\` is a **wildcard**: "any word here". It lets one subscriber catch a whole family of events. The broker does the sorting, so producers just label things and consumers just choose.

        Different brokers spell the rules a bit differently. The RabbitMQ lesson shows one way in detail.` },

    { kind: 'metaphor', title: 'A tape you can rewind',
      body: `With an ordinary queue, reading a message **uses it up**, like a shopper leaving the line.

        A third model works differently: the broker writes every event to the end of a **log**, an ordered list that only grows, and **does not delete an event when it is read**. Events are kept for a set time, often days.

        Think of a **recording**, not a radio broadcast. Each reader has its own pause point on the tape, called an **offset** (the position of the last event they read). One reader can be at the end, watching live. Another can start from the beginning. A third can rewind to last Tuesday and replay.

        That is an **event stream**. Because history is kept, readers who join late, crash, or find a bug can **replay**.` },

    { kind: 'sequence', title: 'Offsets: each reader has its own place',
      body: 'Step through a log with two readers.',
      actors: ['Producer', 'Log', 'Reader'],
      steps: [
        { from: 0, to: 1, label: 'append event 0, 1, 2, 3', note: 'The producer adds four events to the end of the log. They are numbered by position: 0, 1, 2, 3.' },
        { from: 2, to: 1, label: 'read from offset 0', note: 'A new reader starts at the beginning. It can see **everything** that ever happened (within the retention period).' },
        { from: 1, to: 2, label: 'events 0, 1, 2, 3', dashed: true, note: 'The log hands them over. **It keeps them all**: reading deletes nothing.' },
        { at: 2, label: 'remembers: next offset = 4', note: 'The reader saves its own bookmark. A second reader would have a different one.' },
        { at: 2, label: 'bug found in the code!', note: 'The reader’s code had a mistake and produced wrong numbers.' },
        { from: 2, to: 1, label: 're-read from offset 0', note: 'Fix the bug, rewind the bookmark, and **replay the history**. With a queue, those messages would be gone.' }
      ] },

    { kind: 'diagram', title: 'Consumer groups: share the work, and still fan out',
      body: `Streams solve a puzzle. Two copies of your email service should **share** the work, but analytics should still get **everything**.

        The answer is the **consumer group**: a name shared by instances of one service. Within a group the events are **divided up** (like competing consumers). Each separate group gets **every** event (like pub/sub).`,
      nodes: [
        { id: 'l', label: 'Log: orders', icon: '📜', x: 0, y: 1, tone: 'accent' },
        { id: 'e1', label: 'Email instance 1', icon: '✉️', x: 2, y: 0 },
        { id: 'e2', label: 'Email instance 2', icon: '✉️', x: 2, y: 1 },
        { id: 'a1', label: 'Analytics', icon: '📊', x: 2, y: 3 }
      ],
      edges: [
        { from: 'l', to: 'e1', label: 'half', dashed: true },
        { from: 'l', to: 'e2', label: 'other half', dashed: true },
        { from: 'l', to: 'a1', label: 'everything', dashed: true }
      ],
      groups: [
        { label: 'group: email', x: 2, y: 0, w: 1, h: 2 },
        { label: 'group: analytics', x: 2, y: 3, w: 1, h: 1 }
      ],
      caption: 'A group is one logical consumer, however many copies of it are running.' },

    { kind: 'compare', title: 'Three models side by side',
      body: 'Pick by asking who needs the message and for how long.',
      cols: ['Queue', 'Pub/sub', 'Stream (log)'],
      rows: [
        ['Who gets a message?', 'One consumer', 'Every subscriber', 'Every group'],
        ['After it is read', 'Deleted', 'Deleted per subscriber', '**Kept** for a while'],
        ['Late joiner sees the past?', 'No', 'No', '**Yes**, via replay'],
        ['Scaling readers', 'Add consumers', 'Add subscribers', 'Add group members'],
        ['Typical use', 'Background jobs', 'Notifications, events', 'Event history, analytics']
      ],
      note: 'The boundaries blur: brokers often offer more than one model. Kafka is built around the log; RabbitMQ around queues and routing.' },

    { kind: 'pitfall', title: 'Two services, one queue: half each',
      body: `A classic mistake. The billing service and the email service both want "order placed" events, so a developer points **both** at the same queue.

        Now they are competing consumers. Billing gets about half the orders and email gets the other half. Nothing crashes and no error appears. Customers just quietly **do not get invoices, or do not get emails**.

        The fix is to ask whether this is **one job or one event**. If one worker should do it, share a queue. If several services each need every message, give **each service its own queue** (or its own consumer group) fed from the same topic.

        Sharing is for **copies of the same service**. Separate services need separate subscriptions.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Three workers consume from one queue called "invoices". A message arrives. What happens?',
      options: ['Exactly one worker receives it', 'All three receive a copy', 'It goes to worker 1, then is passed on to workers 2 and 3 in turn', 'It is split into three parts, one for each worker'],
      answer: 0,
      why: [null, 'That is publish/subscribe. Competing consumers share a queue, so each message goes to one of them.', 'Messages are not passed along a chain. Once one worker takes a message, the others never see it (barring a failure, covered in a later lesson).', 'Messages are not split. Each one is delivered whole.'],
      explain: 'On a queue the consumers compete. Each message goes to one of them, which is how you spread a job over several workers without doing it twice.' },

    { type: 'match', after: 4, prompt: 'Match each pattern to its description.',
      pairs: [['Competing consumers', 'Several workers share one queue; each message goes to one'], ['Fan-out', 'Every subscriber gets its own copy'], ['Routing key', 'A label such as orders.placed that picks who receives it'], ['Event stream', 'An ordered log that keeps events after they are read'], ['Consumer group', 'Instances of one service sharing the stream between them']] },

    { type: 'tf', after: 6, statement: 'In an event stream (a log), many readers can read the same event, because reading it does not remove it.', answer: true,
      explain: 'True: the log keeps events for its retention period, whoever has read them. Each reader tracks its own position, so many readers can read the same events, and any of them can rewind.' },

    { type: 'bucket', prompt: 'Which model fits each need?', buckets: ['Queue (one worker)', 'Pub/sub (everyone)', 'Stream (keep and replay)'],
      items: [['Generate one invoice PDF per order', 0], ['Resize each uploaded photo once', 0], ['Tell email, warehouse and fraud checks about a new order', 1], ['Push a “price changed” event to every subscribed service', 1], ['Rebuild a report from the last month of events after fixing a bug', 2], ['Let a brand-new service read all past orders', 2]],
      explain: 'One-job-one-worker is a queue. Several services needing the same event is pub/sub. Needing history, or the ability to replay, is what a stream is for.' },

    { type: 'spot', prompt: 'Billing and the email service must each handle every “order placed” event. Tap a line that breaks that.',
      code: { lang: 'js', src: `
        // billing service
        queue.consume('order-events', handleBilling);
        // email service
        queue.consume('order-events', handleEmail);` },
      lines: [2, 4],
      explain: 'Both services consume the **same queue**, so they compete and each sees only about half the events. Each service needs its own queue (or its own consumer group) bound to the same topic.' },

    { type: 'cloze', text: 'In a {{queue}}, each message goes to {{one}} consumer. With {{pub/sub}}, every subscriber gets its own {{copy}}.',
      distractors: ['index', 'all', 'shard'],
      explain: 'Queues share work; pub/sub shares news. The difference is whether a message is divided among consumers or copied to each.' },

    { type: 'short', q: 'What is the name for a reader’s bookmark: the position of the next event it will read in a log?', accept: ['offset', 'offsets', 'consumer offset'], hint: 'It is a number counting along the log.',
      explain: 'The **offset** says how far a reader has got. Because each reader keeps its own, they can all read the same log independently, and any can rewind.' },

    { type: 'scenario', title: 'Who needs to hear about an order?', intro: 'You are designing the messaging for a growing shop. When an order is placed, the warehouse, email, analytics and fraud services all care. You get to choose how the news travels.',
      meters: { 'data correctness': 50, 'team sanity': 60 },
      steps: [
        { text: 'How should checkout tell the four services about a new order?',
          choices: [
            { label: 'Publish an “order placed” event to a topic; each service subscribes with its own queue', score: 2, effects: { 'data correctness': 20, 'team sanity': 20 }, feedback: 'Checkout announces once and each service gets every event. A fifth service later is just another subscription, with no change to checkout.' },
            { label: 'Put the event on one shared queue that all four services read', score: 0, effects: { 'data correctness': -30, 'team sanity': -15 }, feedback: 'The four compete for messages, so each sees about a quarter of the orders. Silent, and awful to debug.' },
            { label: 'Have checkout call all four services directly, one after another', score: 1, effects: { 'data correctness': 5, 'team sanity': -15 }, feedback: 'It works, but checkout now knows every service, waits on all of them, and must be edited for every new one.' }
          ] },
        { text: 'At peak the warehouse falls behind. You start five copies of the warehouse service. How do they receive events?',
          choices: [
            { label: 'Put them in one group sharing the warehouse queue, so each order goes to one copy', score: 2, effects: { 'data correctness': 15, 'team sanity': 15 }, feedback: 'Competing consumers within one service: the work is divided, and orders are picked once.' },
            { label: 'Give each copy its own subscription, so each gets every order', score: 0, effects: { 'data correctness': -30, 'team sanity': -10 }, feedback: 'Five warehouse copies now each pick every order. You would ship five of everything.' },
            { label: 'Keep one copy and live with the backlog', score: 1, effects: { 'team sanity': -10 }, feedback: 'It is safe, but you have thrown away the easy way to scale.' }
          ] },
        { text: 'Analytics finds that last week’s sales numbers were wrong because of a bug in their code. The events are kept in a replayable log. What do they do?',
          choices: [
            { label: 'Fix the bug, rewind their reader to last week’s offset and replay the events', score: 2, effects: { 'data correctness': 30, 'team sanity': 15 }, feedback: 'The history is still in the log, so recomputing is routine. Nobody else is affected: each group has its own position.' },
            { label: 'Ask checkout and the warehouse to re-send last week’s events by hand', score: 0, effects: { 'data correctness': -10, 'team sanity': -30 }, feedback: 'Other teams do not hold that history, and the events would reach every subscriber again. Replay avoids all of this.' },
            { label: 'Adjust the totals by hand and move on', score: 1, effects: { 'data correctness': -10, 'team sanity': -5 }, feedback: 'Quick, but you will never be sure the numbers are right. Replay makes it exact.' }
          ] }
      ],
      outro: 'The pattern: **queues for jobs, pub/sub for news, and a log when history matters.**' },

    { type: 'explain', prompt: 'Explain the difference between a queue with competing consumers and publish/subscribe, using an example of each.',
      model: 'In a queue with competing consumers, several workers share one queue and each message goes to exactly one of them, for example five workers each generating a different invoice PDF. In publish/subscribe, one event is copied to every subscriber, for example an order-placed event reaching email, warehouse and analytics. Queues divide work; pub/sub shares news.',
      keywords: ['queue', 'one consumer', 'competing', 'copy', 'every subscriber', 'work', 'event'] }
  ],

  flashcards: [
    { q: 'What are competing consumers?', a: 'Several consumers reading one queue so each message goes to exactly one of them. It is the easy way to scale a background job.' },
    { q: 'What is publish/subscribe, and what is fan-out?', a: 'A producer publishes an event to a topic and every subscriber gets its own copy. Fan-out is that one-to-many copying.' },
    { q: 'What is a routing key or topic name for?', a: 'It labels an event (such as orders.placed) so the broker can deliver it only to subscribers who asked for that kind, sometimes with wildcards.' },
    { q: 'What makes an event stream different from a queue?', a: 'Reading does not delete events. The log keeps them for a retention period, and each reader has its own offset, so readers can replay or join late.' },
    { q: 'What is a consumer group?', a: 'A name shared by copies of one service. Events are divided among the members of a group, while each separate group receives every event.' }
  ],

  glossary: [
    { term: 'Competing consumers', def: 'Several consumers reading the same queue, each message going to just one of them.', like: 'Five tills serving one line.', aka: ['work queue'] },
    { term: 'Publish/subscribe', def: 'A pattern where publishers announce events to a topic and every subscriber receives a copy.', like: 'A newsletter.', aka: ['pub/sub'] },
    { term: 'Fan-out', def: 'One message being copied to many receivers.', like: 'One announcement over a tannoy, heard in every room.' },
    { term: 'Topic', def: 'A named channel or label for a kind of event, to which messages are published and subscribers listen.', like: 'A radio station number.', aka: ['routing key'] },
    { term: 'Event stream', def: 'An ordered, append-only log of events that keeps them after they are read, so they can be replayed.', like: 'A recording you can rewind.', aka: ['log'] },
    { term: 'Offset', def: 'A reader’s position in a log: the number of the next event it will read.', like: 'A bookmark.' },
    { term: 'Consumer group', def: 'A set of consumer instances that share the events of a stream between them, acting as one logical consumer.', like: 'A team of till operators.' }
  ],

  takeaways: [
    '**Queue:** each message to **one** worker. Add consumers to scale.',
    '**Pub/sub:** each subscriber gets **its own copy**. Topics and routing keys choose who.',
    '**Stream:** a log that keeps events, with a per-reader **offset**, so you can replay.',
    'A **consumer group** shares work inside a service, while separate groups each see everything.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('mq-guarantees', {
  eli5: 'When a worker crashes mid-job, the queue cannot tell whether it finished. So it must either risk losing the job or risk doing it twice. Real systems choose doing it twice, and make doing it twice harmless.',

  cards: [
    { kind: 'concept', title: 'Did the charge happen?',
      body: `A consumer picks up a message: "charge £30 to card 7". It starts work. Then the power cuts out.

        Think about what the **broker** knows. It handed the message over. It never heard back. It cannot tell whether the consumer died *before* charging the card, or *after* charging but before saying so.

        Two choices, both uncomfortable:

        - **Forget the message.** If the card was not charged, the customer got free stuff.
        - **Hand it out again.** If the card *was* charged, the customer is charged twice.

        There is no third option that is free. Every queue's behaviour is a choice between these, and the choice has a name: a **delivery guarantee**.` },

    { kind: 'sequence', title: 'Acknowledgements and redelivery',
      body: 'The mechanism that makes the choice. Step through a crash.',
      actors: ['Broker', 'Consumer 1', 'Consumer 2'],
      steps: [
        { from: 0, to: 1, label: 'deliver “charge £30”', note: 'The broker hands the message to consumer 1 but **keeps it**, marked "in flight".' },
        { at: 1, label: 'starts the work… crashes', note: 'The consumer dies before it can report back.' },
        { note: 'No acknowledgement arrives. The broker notices when the connection drops, or when a timeout runs out.' },
        { from: 0, to: 2, label: 'redeliver “charge £30”', note: 'The broker assumes the work may not have been done and **offers the message again**, to someone else.' },
        { at: 2, label: 'does the work', note: 'Consumer 2 does the job. (Maybe for the second time. It cannot know.)' },
        { from: 2, to: 0, label: 'ack', note: 'The **acknowledgement** tells the broker it can finally delete the message.' }
      ] },

    { kind: 'metaphor', title: 'Signing for a parcel',
      body: `A courier arrives with a parcel and you sign. The courier records the signature and the job is done. You, the courier and the depot all agree.

        But imagine the courier's handheld loses signal as you sign. The depot never learns the parcel was delivered. At the end of the day it **sends the courier again**, and you receive a second parcel. The courier was *right to try again*: a missing signature looks exactly like a parcel that never arrived.

        That is the whole story of queues. The **acknowledgement** is the signature. If it goes missing the broker retries, and sometimes the thing it retries has already happened.

        Where the metaphor stops: two parcels is a nuisance. Two charges to a card is a customer-service call.` },

    { kind: 'compare', title: 'At most once, at least once',
      body: 'The two honest guarantees, decided by **when the consumer acknowledges**.',
      cols: ['At most once', 'At least once'],
      rows: [
        ['When to ack', '**Before** doing the work', '**After** doing the work'],
        ['If the consumer crashes mid-job', 'Message lost, never redone', 'Message redelivered, redone'],
        ['What can go wrong', 'Lost work', 'Duplicate work'],
        ['Good for', 'Data you can afford to lose', 'Anything that matters'],
        ['Typical example', 'A live temperature reading', 'Charging a card, shipping an order']
      ],
      note: 'In plain words: at-most-once means 0 or 1 times. At-least-once means 1 or more.' },

    { kind: 'concept', title: '“Exactly once” is mostly a myth',
      body: `Surely a good system can deliver every message **exactly once**? Between two machines on a network, you cannot *guarantee* it, for the reason in the first card: the sender cannot tell "it did not arrive" from "it arrived but the reply was lost".

        What you *can* build is the **effect** of exactly once:

        > **at-least-once delivery + an idempotent consumer = effectively-once**

        The message may arrive twice, but handling it twice does the same as handling it once. (Recall idempotent from the HTTP lesson: safe to repeat.)

        Some systems advertise "exactly-once" within their own walls, such as Kafka's transactions, but the guarantee covers their internal reads and writes. The moment your consumer sends an email or calls a payment API, duplicates are your problem again.` },

    { kind: 'code', title: 'An idempotent consumer',
      body: 'The trick is to remember which message ids you have already handled. **Tap the lines.**',
      code: { lang: 'js', src: `
        queue.consume('payments', async (msg) => {
          const seen = await db.exists('processed', msg.id);
          if (seen) return msg.ack();
          await db.transaction(async (tx) => {
            await tx.insert('payments', msg.payload);
            await tx.insert('processed', { id: msg.id });
          });
          msg.ack();
        });`,
        notes: {
          2: 'Every message carries a **unique id**, set by the producer. We ask: "have I handled this one before?"',
          3: 'If so, this is a duplicate. Do nothing, but **still acknowledge**, or the broker would redeliver it forever.',
          4: 'The real work and the "I did it" record go in **one transaction**, so they succeed or fail together. Otherwise a crash between them would let a duplicate through.',
          6: 'The \`processed\` table is the memory. (A database unique constraint on the id is an even sturdier way to do the same job.)',
          8: 'Acknowledge **last**, after the work is safely recorded. This ordering is what makes it at-least-once.'
        } } },

    { kind: 'concept', title: 'Ordering: you get less than you think',
      body: `You send three messages: **create account, add address, close account**. Do they arrive in that order? Often yes, but the broker does not promise it, and these things break it:

        - **Several consumers** work in parallel. Whoever finishes first "wins", so message 3 can be completed before message 2.
        - **Redelivery.** Message 2 fails and returns to the queue *after* message 3 has been handled.
        - **Several queues or partitions.** Order holds only inside one.

        Ways to cope: keep **related** messages together so one consumer sees them in order (for example everything for customer 7 goes to the same place); put a **sequence number** on messages and ignore stale ones; or design handlers to **not care about order**.

        The Kafka lesson shows how partitions give you order where you need it, and only there.` },

    { kind: 'diagram', title: 'Dead-letter queues: somewhere for failures to go',
      body: 'Some messages fail again and again. After a set number of attempts the broker moves them aside, to a **dead-letter queue** (DLQ).',
      nodes: [
        { id: 'q', label: 'Main queue', icon: '📬', x: 0, y: 1 },
        { id: 'c', label: 'Consumer', icon: '⚙️', x: 1, y: 1 },
        { id: 'd', label: 'Dead-letter queue', icon: '☠️', x: 1, y: 3, tone: 'bad' },
        { id: 'h', label: 'Humans inspect', icon: '🧑‍🔧', x: 2, y: 3 }
      ],
      edges: [
        { from: 'q', to: 'c', label: 'deliver' },
        { from: 'c', to: 'q', label: 'fail: retry', dashed: true },
        { from: 'q', to: 'd', label: 'after N failures', dashed: true },
        { from: 'd', to: 'h', label: 'alert' }
      ],
      caption: 'The queue gives up on the message, not on the rest of the traffic. Everything else keeps flowing.' },

    { kind: 'pitfall', title: 'The poison message',
      body: `A **poison message** is one that can never succeed: malformed data, a reference to something deleted, or input that triggers a bug. The consumer crashes, the broker redelivers, the consumer crashes again.

        Without a limit, that one message loops **forever**. Worse, it may sit at the front of the queue and block everything behind it, while each retry burns CPU and fills the logs.

        The defences:

        - **Cap the retries**, then move the message to the DLQ.
        - **Back off** between retries, in case it is a temporary fault.
        - **Alert when the DLQ is not empty.** A DLQ nobody watches is just a slower way to lose data.
        - After the fix, **replay** the DLQ's messages into the main queue.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A consumer receives a message, does half the work, then crashes before acknowledging. What does the broker do?',
      options: ['Offers the message again, to this or another consumer', 'Deletes it, because it was already delivered once', 'Holds it forever and blocks the queue', 'Sends an error back to the producer to resend it'],
      answer: 0,
      why: [null, 'Delivery is not completion. The broker deletes a message only when it is acknowledged.', 'It does not block. It simply makes the message available again.', 'The producer finished its job long ago and is not involved in redelivery.'],
      explain: 'No acknowledgement means the broker cannot know if the job finished, so it redelivers. That is how work survives crashes, and why duplicates are possible.' },

    { type: 'match', after: 3, prompt: 'Match each guarantee or term to its meaning.',
      pairs: [['At most once', 'Never duplicated, but can be lost'], ['At least once', 'Never lost, but can be duplicated'], ['Effectively once', 'At-least-once delivery plus an idempotent consumer'], ['Acknowledgement', 'Tells the broker a message is fully handled'], ['Redelivery', 'The broker offering a message again after no ack']] },

    { type: 'tf', after: 4, statement: 'Between two machines on a network, a system can fully guarantee that every message is processed exactly once.', answer: false,
      explain: 'A sender cannot distinguish "lost before arriving" from "arrived but the reply was lost". In practice you get at-least-once delivery and make the consumer idempotent to get the effect of exactly once.' },

    { type: 'bucket', prompt: 'Which approach suits each job?', buckets: ['At-most-once is fine', 'At-least-once and idempotent'],
      items: [['Temperature readings taken every second', 0], ['A “user is typing…” indicator', 0], ['A sampled metrics counter for a dashboard', 0], ['Charging a card', 1], ['Reserving stock for an order', 1], ['Sending a password-reset email', 1]],
      explain: 'If the next message will make up for a lost one, losing it is harmless. If a lost message means a missing charge or email, you need at-least-once, and duplicates must then be harmless.' },

    { type: 'spot', prompt: 'This consumer is meant to send every email at least once. Tap the line that breaks that promise.',
      code: { lang: 'js', src: `
        queue.consume('emails', async (msg) => {
          msg.ack();
          await sendEmail(msg.to);
        });` },
      lines: [2],
      explain: 'Acknowledging **before** the work means a crash during `sendEmail` loses the message: the broker thinks it is done. That is at-most-once. The ack belongs after the work.' },

    { type: 'ab', q: 'A message “add £30 to account 7” can be delivered twice. Which handler is safe against that?',
      a: { lang: 'sql', label: 'Add to the balance', src: `
        UPDATE accounts
        SET balance = balance + 30
        WHERE id = 7;` },
      b: { lang: 'sql', label: 'Record by message id', src: `
        INSERT INTO deposits (id, account_id, amount)
        VALUES ('msg-981', 7, 30)
        ON CONFLICT (id) DO NOTHING;` },
      answer: 'b',
      explain: 'Adding is not idempotent: two deliveries add £60. Recording the deposit under the message’s unique id means the second attempt does nothing. The balance is then worked out from the recorded deposits.' },

    { type: 'scenario', title: 'The message that will not die', intro: 'Monday morning. Your order-processing queue has stopped moving. The logs show the same message being redelivered thousands of times, and the consumer crashing each time.',
      meters: { 'queue health': 30, 'data safety': 60 },
      steps: [
        { text: 'One malformed message at the front is crashing the consumer on every attempt. What is the right longer-term fix?',
          choices: [
            { label: 'Limit retries to a few attempts, then move the message to a dead-letter queue', score: 2, effects: { 'queue health': 40, 'data safety': 10 }, feedback: 'The poison message is set aside, not destroyed, and everything behind it flows again.' },
            { label: 'Delete the message by hand without looking at it', score: 1, effects: { 'queue health': 30, 'data safety': -25 }, feedback: 'Traffic moves, but you have destroyed an order you never read, and the next poison message will stall the queue again.' },
            { label: 'Keep restarting the consumer until it works', score: 0, effects: { 'queue health': -10 }, feedback: 'It will crash on the same message every time. You are just restarting a loop.' }
          ] },
        { text: 'The bad message is now in the dead-letter queue. What do you do with it?',
          choices: [
            { label: 'Inspect it, find out why it failed, fix the code or data, then replay it', score: 2, effects: { 'data safety': 30, 'queue health': 10 }, feedback: 'That order is real. Once the cause is fixed, put it back on the main queue and it completes normally.' },
            { label: 'Purge the dead-letter queue to keep it tidy', score: 0, effects: { 'data safety': -40 }, feedback: 'The DLQ exists to keep these for human review. Purging it destroys the evidence and the orders.' },
            { label: 'Leave it and hope someone notices', score: 0, effects: { 'data safety': -25 }, feedback: 'An unwatched DLQ is a graveyard. Alert on it being non-empty so a human looks.' }
          ] },
        { text: 'Another night, the database is down for 30 seconds and a burst of messages fail. They were fine messages, with a temporary fault. How should retries work?',
          choices: [
            { label: 'Retry with a growing delay a few times, and only then use the dead-letter queue', score: 2, effects: { 'queue health': 25, 'data safety': 15 }, feedback: 'Delays ride out temporary faults, and the limit still protects you from true poison messages.' },
            { label: 'Retry instantly, as fast as possible, forever', score: 0, effects: { 'queue health': -30 }, feedback: 'Thousands of instant retries pile load onto a database that is trying to recover.' },
            { label: 'Send every failure straight to the dead-letter queue', score: 1, effects: { 'queue health': 5, 'data safety': 5 }, feedback: 'Safe, but you now have a manual clean-up after every blip, for faults that would have healed on their own.' }
          ] }
      ],
      outro: 'The pattern: **retry sensibly, cap it, set failures aside, and make someone look at them.**' },

    { type: 'short', q: 'What word describes a consumer that can safely process the same message twice, with the same result as once?', accept: ['idempotent', 'idempotence', 'idempotency'], hint: 'You met this word in the HTTP lesson, with PUT and DELETE.',
      explain: '**Idempotent** handlers make at-least-once delivery safe: a duplicate is harmless, so effectively-once is achievable.' },

    { type: 'explain', prompt: 'A colleague asks for “exactly-once delivery” for payment messages. Explain why that is hard, and what you would build instead.',
      model: 'A sender cannot tell a message that never arrived from one whose acknowledgement was lost, so the broker either risks losing it or redelivering it. For payments you would choose at-least-once, acknowledging only after the work is done, and make the consumer idempotent by recording each message id so that a duplicate has no effect. Together that gives effectively-once.',
      keywords: ['at-least-once', 'acknowledge', 'duplicate', 'idempotent', 'message id', 'effectively once', 'crash'] }
  ],

  flashcards: [
    { q: 'What is the difference between at-most-once and at-least-once?', a: 'At-most-once acks before the work: no duplicates, but crashes lose messages. At-least-once acks after: no losses, but crashes cause duplicates.' },
    { q: 'Why is “exactly-once” delivery hard?', a: 'The sender cannot tell a lost message from a lost acknowledgement, so it must risk loss or duplication. You build effectively-once instead.' },
    { q: 'What makes a consumer idempotent?', a: 'It remembers handled message ids (or uses a unique constraint), so a duplicate does nothing. Work and the record go in one transaction.' },
    { q: 'What can break message ordering?', a: 'Parallel consumers, redelivery after a failure, and multiple queues or partitions. Order holds only within one queue or partition.' },
    { q: 'What are a dead-letter queue and a poison message?', a: 'A poison message always fails. After a retry limit, the broker moves it to a dead-letter queue so the rest keeps flowing and humans can inspect it.' }
  ],

  glossary: [
    { term: 'Delivery guarantee', def: 'The promise a messaging system makes about how many times a message will be processed: at most once, at least once, or (effectively) exactly once.', like: 'The courier’s promise about your parcel.' },
    { term: 'At-least-once', def: 'Every message is delivered one or more times. Nothing is lost, but duplicates can happen after a failure.', like: 'A courier who keeps coming back until someone signs.' },
    { term: 'At-most-once', def: 'Every message is delivered zero or one times. No duplicates, but a failure can lose a message.', like: 'Posting a postcard and keeping no copy.' },
    { term: 'Idempotent consumer', def: 'A consumer for which handling a message twice has the same effect as handling it once.', like: 'Pressing a lift button twice.' },
    { term: 'Dead-letter queue', def: 'A side queue where messages that have failed too many times are moved for inspection.', like: 'The sorting office’s “undeliverable mail” shelf.', aka: ['DLQ'] },
    { term: 'Poison message', def: 'A message that always causes the consumer to fail, however many times it is retried.', like: 'A jammed item at the front of a conveyor belt.' }
  ],

  takeaways: [
    'The broker cannot tell a crashed job from a lost ack, so it must risk **loss** (at-most-once) or **duplicates** (at-least-once).',
    'Ack **after** the work for at-least-once. Make consumers **idempotent**: that is “effectively once”.',
    'Order holds only **within one queue or partition**, and parallel work and retries weaken it.',
    '**Cap retries**, move poison messages to a **dead-letter queue**, and alert on it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('mq-rabbitmq', {
  eli5: 'RabbitMQ is a smart post office. Senders hand letters to a sorting desk (an exchange) with an address label; rules at the desk decide which mailboxes (queues) get a copy; workers collect from the mailboxes.',

  cards: [
    { kind: 'concept', title: 'Senders do not know the mailboxes',
      body: `**RabbitMQ** is one of the most widely used message brokers: free, open source and mature. Its design has one idea that surprises newcomers.

        A producer does **not** put messages straight into a queue. It hands them to an **exchange**, along with a label called a **routing key**. The exchange then decides **which queues** get the message, using rules you set up.

        Why the extra step? Because the producer need not know who is listening. It just says "here is a message about \`orders.placed\`". Moving a consumer, adding a second one, or splitting a queue becomes a change to the rules, never to the producer.

        The result is a broker with **real intelligence about routing**, which is where its reputation comes from.` },

    { kind: 'metaphor', title: 'The sorting office',
      body: `Picture a post office. You do not walk letters to people's houses. You post them and the sorting office reads the address and decides where each goes.

        - the **sorting desk** is the **exchange**
        - the **address on the envelope** is the **routing key**
        - the **pigeonholes** are the **queues**
        - the **rules pinned to the wall** ("anything for Leeds goes in pigeonhole 4") are **bindings**
        - the **postal workers** emptying the pigeonholes are **consumers**

        Each sorting desk has its own style of reading addresses. That is what the four **exchange types** are.

        Where the metaphor stops: a real post office sends a letter to one place. A RabbitMQ exchange can put copies in several pigeonholes at once.` },

    { kind: 'diagram', title: 'Exchange, bindings, queues',
      body: 'A binding is a rule linking an exchange to a queue. A message goes to every queue whose binding matches its routing key.',
      nodes: [
        { id: 'p', label: 'Producer', icon: '🛒', x: 0, y: 1 },
        { id: 'x', label: 'Exchange: orders', icon: '🔀', x: 1, y: 1, tone: 'accent' },
        { id: 'q1', label: 'Queue: warehouse', icon: '📬', x: 2, y: 0 },
        { id: 'q2', label: 'Queue: refunds', icon: '📬', x: 2, y: 2 },
        { id: 'c1', label: 'Warehouse worker', icon: '📦', x: 3, y: 0 },
        { id: 'c2', label: 'Refund worker', icon: '💷', x: 3, y: 2 }
      ],
      edges: [
        { from: 'p', to: 'x', label: 'key: orders.placed' },
        { from: 'x', to: 'q1', label: 'binding: placed', dashed: true },
        { from: 'x', to: 'q2', label: 'binding: cancelled', dashed: true },
        { from: 'q1', to: 'c1' },
        { from: 'q2', to: 'c2' }
      ],
      caption: 'This message has key orders.placed, so it matches the first binding and lands only in warehouse.' },

    { kind: 'compare', title: 'The four exchange types',
      body: 'The type decides how the exchange reads the routing key.',
      cols: ['How it routes', 'Typical use'],
      rows: [
        ['**Direct**', 'Key must **exactly match** the binding key', 'Send each job type to its own queue'],
        ['**Topic**', 'Key is dotted words; bindings use patterns', 'Flexible routing: by region, severity, kind'],
        ['**Fanout**', '**Ignores** the key; copies to every bound queue', 'Broadcasts: cache clears, price updates'],
        ['**Headers**', 'Matches on message **headers**, not the key', 'Rare: when routing on several attributes']
      ],
      note: 'There is also a nameless **default exchange**: it routes a message to the queue whose name equals the routing key. It is why beginner tutorials appear to "send straight to a queue".' },

    { kind: 'code', title: 'Topic patterns in action',
      body: 'Routing keys on a topic exchange are words joined by dots. Bindings can use two wildcards. **Tap the lines.**',
      code: { lang: 'text', src: `
        exchange "orders" (type: topic)
        warehouse  bound with  orders.placed
        refunds    bound with  orders.cancelled
        audit      bound with  orders.#

        publish "orders.placed"       -> warehouse, audit
        publish "orders.cancelled"    -> refunds, audit
        publish "orders.shipped.eu"   -> audit
        publish "payments.failed"     -> (nobody)`,
        notes: {
          1: 'A **topic** exchange. Producers publish with keys such as \`orders.placed\`, and each queue declares which keys it wants.',
          4: '\`#\` means **zero or more words**. \`orders.#\` catches \`orders.placed\`, \`orders.shipped.eu\`, anything starting \`orders.\`.',
          6: 'One message, **two queues**: the exact binding and the wildcard binding both match, so each queue gets its own copy.',
          8: 'Three words, so only the \`#\` binding matches. The other wildcard, \`*\`, means **exactly one word**, so \`orders.*\` would match \`orders.placed\` but not \`orders.shipped.eu\`.',
          9: 'No binding matches. By default the message is **silently dropped**. (Options exist to catch these, but you have to turn them on.)'
        } } },

    { kind: 'concept', title: 'Acknowledgements and durability',
      body: `What you learned last lesson applies here directly. A RabbitMQ consumer normally uses **manual acknowledgements**: it does the work, then tells the broker. If its connection dies first, the broker puts the message back and gives it to another consumer.

        A consumer can also say **nack** ("I could not do this"), asking for the message to be requeued or moved to a **dead-letter exchange**, which is RabbitMQ's version of a dead-letter queue.

        To survive a **broker restart**, three things must hold: the queue is **durable**, the message is marked **persistent**, and ideally the producer uses **publisher confirms**, where the broker says "I have safely stored that". Skip any one of these and a restart can quietly lose messages.` },

    { kind: 'sequence', title: 'Prefetch: do not hand out the whole pile',
      body: 'By default a broker may push many messages to one consumer at once. **Prefetch** caps how many unacknowledged messages a consumer may hold. Here it is set to 1.',
      actors: ['Broker', 'Slow worker', 'Fast worker'],
      steps: [
        { from: 0, to: 1, label: 'job 1 (big)', note: 'The slow worker takes a large job. It now holds one unacknowledged message, so it is **full**.' },
        { from: 0, to: 2, label: 'job 2 (small)', note: 'The fast worker takes the next.' },
        { from: 2, to: 0, label: 'ack job 2', note: 'The fast worker finishes quickly and acknowledges.' },
        { from: 0, to: 2, label: 'job 3', note: 'The broker sends the fast worker the next job, **not** the busy slow worker.' },
        { from: 2, to: 0, label: 'ack job 3', note: 'Done again.' },
        { from: 0, to: 2, label: 'job 4', note: 'Work flows to whoever is free. Without a prefetch limit, the broker could have pushed jobs 3 to 20 onto the slow worker, with the fast one idle.' }
      ] },

    { kind: 'realworld', title: 'What RabbitMQ is best at',
      body: `RabbitMQ shines at **task queues and flexible routing** between services:

        - **Background jobs:** emails, image resizing, report generation, spread across workers.
        - **Smart routing:** one event reaching exactly the right services, via topic or headers rules.
        - **Many small messages** with quick delivery and per-message acknowledgements.
        - **Wide client support:** libraries for nearly every language, and straightforward to run.

        It is a weaker fit for **keeping history**. Classic queues remove a message once it is acknowledged, so you cannot replay last month's events from one. (Newer RabbitMQ releases do have a log-style "stream" feature, but replay is the Kafka lesson's home turf.)` },

    { kind: 'pitfall', title: 'Three quiet ways to lose or jam messages',
      body: `**1. No matching binding.** Publish to an exchange with no queue bound for that key and the message simply disappears. Producers get no error. Declare and bind the queues *first*, and consider catching unroutable messages.

        **2. Forgetting to acknowledge.** Messages stay "unacked", pile up in memory, and flood back when the connection drops. Turning acks off (\`noAck\`) makes it fast but at-most-once: a crash loses the job.

        **3. A growing queue nobody watches.** Producers faster than consumers means a backlog that eats memory and disk. Alert on queue length and on the age of the oldest message.

        All three are silent. Nothing throws an error. **Monitoring is part of running a broker.**` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In RabbitMQ’s normal model, where does a producer publish a message?',
      options: ['To an exchange, with a routing key', 'Straight into a specific queue', 'Directly to the consumer', 'To a database that consumers poll'],
      answer: 0,
      why: [null, 'Producers do not address queues. (Beginner examples appear to, but they use the nameless default exchange.)', 'Consumers and producers never talk directly. The broker sits between them.', 'There is no database; the broker delivers to consumers itself.'],
      explain: 'The exchange takes the message and applies bindings to decide which queues get a copy. This keeps producers ignorant of the consumers.' },

    { type: 'match', after: 3, prompt: 'Match each exchange type to how it routes.',
      pairs: [['Direct', 'Routing key must match the binding exactly'], ['Topic', 'Dotted key matched against patterns with * and #'], ['Fanout', 'Copies to every bound queue, ignoring the key'], ['Headers', 'Matches on message header values'], ['Default exchange', 'Sends to the queue named by the routing key']] },

    { type: 'bucket', prompt: 'Which exchange type fits each need?', buckets: ['Direct', 'Topic', 'Fanout'],
      items: [['Send each “invoice” job to the invoice queue by exact name', 0], ['Send “error” logs to one queue and “info” logs to another', 0], ['Route sensor.kitchen.temp and sensor.garage.temp by location and kind', 1], ['One consumer wants every message about orders.*', 1], ['Tell every app server to clear its cache', 2], ['Show a new price on every screen in every shop', 2]],
      explain: 'Exact names mean direct. Patterns over structured keys mean topic. “Everyone, no matter the key” means fanout.' },

    { type: 'tf', after: 8, statement: 'By default, RabbitMQ silently drops a message whose routing key matches no binding.', answer: true,
      explain: 'True: by default an unroutable message is silently dropped. Bind your queues before publishing, and enable the options that catch or report unroutable messages if you cannot afford the loss.' },

    { type: 'spot', prompt: 'The audit queue must receive every order event, including three-word keys such as `orders.shipped.eu`. Tap the binding that falls short.',
      code: { lang: 'text', src: `
        bind warehouse  key=orders.placed
        bind refunds    key=orders.cancelled
        bind audit      key=orders.*` },
      lines: [3],
      explain: '`*` matches exactly **one** word, so `orders.*` catches `orders.placed` but not `orders.shipped.eu`. `orders.#`, where `#` means zero or more words, catches everything under `orders`.' },

    { type: 'ab', q: 'A queue of slow image-resizing jobs is shared by several workers. Which consumer set-up is safer and fairer?',
      a: { lang: 'js', label: 'Prefetch 1, manual ack', src: `
        channel.prefetch(1);
        channel.consume('resize', async (msg) => {
          await resize(msg);
          channel.ack(msg);
        });` },
      b: { lang: 'js', label: 'No acks, no limit', src: `
        channel.consume('resize', async (msg) => {
          await resize(msg);
        }, { noAck: true });` },
      answer: 'a',
      explain: 'A prefetch limit stops one worker hoarding jobs while others sit idle, and acking after the work means a crash redelivers the job. Without acks the broker forgets each message the moment it is sent, so a crash loses it.' },

    { type: 'short', q: 'Which exchange type copies every message to all bound queues, ignoring the routing key?', accept: ['fanout', 'fanout exchange'], hint: 'The message fans out.',
      explain: '**Fanout** is the broadcast exchange: every bound queue gets a copy, whatever the routing key says.' },

    { type: 'scenario', title: 'Wiring the log pipeline', intro: 'Your company’s services all emit log events. You have been asked to set up RabbitMQ so the on-call team is paged for errors, while an archive service stores everything.',
      meters: { reliability: 40, simplicity: 60 },
      steps: [
        { text: 'Services publish keys like "payments.error" and "search.info". How do you route them?',
          choices: [
            { label: 'A topic exchange: bind the pager queue to *.error and the archive queue to #', score: 2, effects: { reliability: 20, simplicity: 10 }, feedback: 'One exchange, two bindings. Errors reach both queues and everything else reaches only the archive. Adding a service needs no routing changes.' },
            { label: 'A fanout exchange: every log goes to both queues', score: 1, effects: { reliability: 5, simplicity: 5 }, feedback: 'Simple, but the pager now gets every info log too. Someone will be paged at 3 a.m. for nothing.' },
            { label: 'Make each service publish into both queues itself', score: 0, effects: { simplicity: -25 }, feedback: 'Every producer now knows the queues. Adding a third consumer means editing every service. The exchange exists to avoid exactly this.' }
          ] },
        { text: 'The archive workers are slow. One worker is sitting on 200 unacknowledged messages while three others idle. What do you change?',
          choices: [
            { label: 'Set a small prefetch so each worker holds only a few messages at a time', score: 2, effects: { reliability: 10, simplicity: 10 }, feedback: 'Work now flows to whichever worker is free, so the pile is shared fairly.' },
            { label: 'Turn off acknowledgements so messages stop piling up', score: 0, effects: { reliability: -30 }, feedback: 'The pile disappears because the broker forgets each message the moment it is sent. A crash now loses logs silently.' },
            { label: 'Add yet more workers', score: 1, effects: { simplicity: -10 }, feedback: 'The hoarding worker still holds its 200. Extra workers will mostly sit idle until prefetch is fixed.' }
          ] },
        { text: 'The broker is restarted for an upgrade and a batch of queued error events vanishes. What should you have set up?',
          choices: [
            { label: 'Durable queues, persistent messages, and publisher confirms', score: 2, effects: { reliability: 30 }, feedback: 'Durable queues survive the restart, persistent messages are written to disk, and confirms tell the producer the broker really has the message.' },
            { label: 'Nothing: restarts always lose messages, so tolerate it', score: 0, effects: { reliability: -20 }, feedback: 'They do not have to. The defaults favour speed, but you can ask for durability.' },
            { label: 'Keep everything in memory for speed', score: 0, effects: { reliability: -30 }, feedback: 'Memory is wiped on restart. That is the opposite of what you needed.' }
          ] }
      ],
      outro: 'The pattern: **route with the exchange, share work with prefetch, and ask for durability explicitly.**' },

    { type: 'explain', prompt: 'Explain what an exchange, a queue and a binding are in RabbitMQ, and why producers publish to an exchange instead of a queue.',
      model: 'A producer publishes a message with a routing key to an exchange. The exchange compares the key with its bindings, which are rules linking it to queues, and places a copy in each matching queue. Consumers read from the queues. This means producers never need to know which queues or consumers exist, so you can add or change consumers by changing bindings only.',
      keywords: ['exchange', 'queue', 'binding', 'routing key', 'copy', 'producer', 'consumer'] }
  ],

  flashcards: [
    { q: 'How do messages reach queues in RabbitMQ?', a: 'Producers publish to an exchange with a routing key. The exchange applies its bindings (rules) and places a copy in each matching queue.' },
    { q: 'Name the four exchange types.', a: 'Direct (exact key match), topic (patterns with * and #), fanout (every bound queue) and headers (match on message headers).' },
    { q: 'What do * and # mean in a topic binding?', a: '* matches exactly one word; # matches zero or more words. So orders.* matches orders.placed but not orders.shipped.eu, while orders.# matches both.' },
    { q: 'What does prefetch do?', a: 'It limits how many unacknowledged messages a consumer may hold, so work flows to free workers instead of piling on a slow one.' },
    { q: 'What three things help messages survive a RabbitMQ restart?', a: 'A durable queue, persistent messages, and publisher confirms from the broker.' }
  ],

  glossary: [
    { term: 'Exchange', def: 'The part of RabbitMQ that receives messages from producers and routes them to queues according to bindings.', like: 'The sorting desk at a post office.' },
    { term: 'Binding', def: 'A rule that links an exchange to a queue, often with a binding key or pattern deciding which messages match.', like: 'The sign saying “Leeds goes in pigeonhole 4”.' },
    { term: 'Routing key', def: 'A label on a published message, such as orders.placed, that exchanges use to decide where it goes.', like: 'The address on an envelope.' },
    { term: 'Prefetch', def: 'A limit on how many unacknowledged messages the broker will hand to one consumer at a time.', like: 'A waiter carrying only two plates at a time.', aka: ['QoS'] },
    { term: 'Dead-letter exchange', def: 'An exchange that receives messages which were rejected, expired or failed too many times, so they can be inspected or replayed.', like: 'The undeliverable-mail shelf.', aka: ['DLX'] }
  ],

  takeaways: [
    'Producers publish to an **exchange** with a **routing key**; **bindings** decide which **queues** get a copy.',
    'Four exchange types: **direct, topic, fanout, headers**. In topics, \`*\` is one word and \`#\` is zero or more.',
    'Use **manual acks** plus a small **prefetch**; ask for **durable** queues and **persistent** messages.',
    'Best at **task queues and routing**. Unrouted messages vanish silently, so monitor it.'
  ],

  links: [
    { label: 'RabbitMQ tutorials', url: 'https://www.rabbitmq.com/tutorials' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('mq-kafka', {
  eli5: 'Kafka is a giant, never-rubbed-out notebook that many programs read at once. New events are written at the end, each reader keeps its own finger on its page, and the old pages stay for as long as you choose.',

  cards: [
    { kind: 'concept', title: 'A log, not a mailbox',
      body: `Imagine a big online shop. Every click, order, payment and delivery is an **event**. Dozens of systems care: billing, search, recommendations, fraud, analytics. New ones will care next year. Events arrive by the million.

        **Apache Kafka** was built at LinkedIn for exactly this, and is now used across the industry. Its central idea is simple: instead of a mailbox that empties as people read, keep a **log**: an ordered list of events that you only ever **add to the end of**.

        Events are **not deleted when read**. They stay for a time you choose. Any number of programs can read the same log at their own speed, and a new program can start from the beginning.

        That one decision explains most of how Kafka feels different from RabbitMQ.` },

    { kind: 'metaphor', title: 'The shop ledger',
      body: `An old shopkeeper keeps a ledger. Every sale is written on the next free line, in ink, never crossed out. Mistakes are fixed by writing a *new* line.

        Three people read it: the accountant, the stock-checker and the tax inspector. Each keeps a **finger on the last line they read**. They never get in each other's way, and nobody tears out a page when they finish it.

        A new bookkeeper joining next year can start at page one and rebuild the whole history.

        Where the metaphor stops: one ledger on one desk is easy. Kafka's log is **split into several parts and copied across many machines**, which is what the next cards are about.` },

    { kind: 'code', title: 'Topics, partitions and offsets',
      body: 'A **topic** is a named log, such as `orders`. To spread the load it is cut into **partitions**: separate logs that can live on different machines. **Tap the lines.**',
      code: { lang: 'text', src: `
        topic "orders"  (3 partitions)

        P0:  [0] [1] [2] [3] [4]
        P1:  [0] [1] [2]
        P2:  [0] [1] [2] [3]

        key "cust-7"  ->  hash  ->  always P1
        key "cust-9"  ->  hash  ->  always P2`,
        notes: {
          1: 'A topic is a category of events. Producers write to it; consumers read from it.',
          3: 'Each partition is its own **append-only log**. The numbers are **offsets**: an event’s position within its partition. Offsets only grow, and they are never reused.',
          4: 'Partitions grow at their own pace. Offset 2 on P1 and offset 2 on P0 are completely unrelated events.',
          7: 'A producer can attach a **key** to each event. Kafka hashes the key to pick the partition, so **the same key always goes to the same partition**.',
          8: 'Different customers can be spread over different partitions, which is how the work is shared out.'
        } } },

    { kind: 'concept', title: 'Order holds only inside a partition',
      body: `Kafka promises that events in **one partition** stay in the order they were written. It promises **nothing** about order *between* partitions.

        That sounds like a weakness, but it is the price of spreading the load over many machines, and the key gives it back where it matters.

        Customer 7 places an order, then cancels it. If both events carry the key \`cust-7\`, they go to the same partition, and every reader sees them **in that order**. Events for customer 9 may be anywhere else, and that is fine: nobody needs customers 7 and 9 in a global order.

        So: **pick as the key the thing whose events must stay in order**: a customer, an account, a device.` },

    { kind: 'concept', title: 'The log keeps everything, and readers keep a bookmark',
      body: `Because reading does not delete anything, each consumer simply remembers **how far it has read**: an offset per partition. That bookmark is **committed** back to Kafka so a restarted consumer carries on where it left off.

        This gives you things a classic queue cannot:

        - **Replay:** set the bookmark back and read last week again, perhaps after fixing a bug.
        - **Late joiners:** a new service starts at the beginning and catches up.
        - **Independence:** a slow reader falls behind only itself. The gap between the end of the log and its bookmark is its **lag**.

        Kafka is also **fast** partly because writing to the end of a file is among the quickest things a disk can do.` },

    { kind: 'diagram', title: 'Consumer groups share the partitions',
      body: `Within a **consumer group**, each partition goes to **one** member at a time. Different groups each read **everything**. It is the pattern from the earlier lesson, now with partitions as the unit of sharing.`,
      nodes: [
        { id: 't', label: 'Topic: 3 partitions', icon: '📜', x: 0, y: 1, tone: 'accent' },
        { id: 'c1', label: 'Billing A: P0, P1', icon: '💷', x: 2, y: 0 },
        { id: 'c2', label: 'Billing B: P2', icon: '💷', x: 2, y: 1 },
        { id: 'a', label: 'Analytics: P0, P1, P2', icon: '📊', x: 2, y: 3 }
      ],
      edges: [
        { from: 't', to: 'c1', label: 'P0, P1', dashed: true },
        { from: 't', to: 'c2', label: 'P2', dashed: true },
        { from: 't', to: 'a', label: 'all three', dashed: true }
      ],
      groups: [
        { label: 'group: billing', x: 2, y: 0, w: 1, h: 2 },
        { label: 'group: analytics', x: 2, y: 3, w: 1, h: 1 }
      ],
      caption: 'A partition is read by at most one member of a group. So 3 partitions means at most 3 useful consumers per group; a fourth would sit idle.' },

    { kind: 'sequence', title: 'Rebalancing when a consumer joins',
      body: 'When members join, leave or crash, the group must **re-divide** the partitions. That is a **rebalance**.',
      actors: ['Consumer A', 'Kafka', 'Consumer B'],
      steps: [
        { note: 'Consumer A is alone in the group and reads all three partitions: P0, P1 and P2.' },
        { from: 2, to: 1, label: 'join group billing', note: 'A second copy of the service starts up and asks to join.' },
        { from: 1, to: 0, label: 'rebalance: stop reading', dashed: true, note: 'Kafka tells the members to **pause** while it re-plans. In the simplest scheme, reading stops briefly for the whole group.' },
        { at: 1, label: 'new plan: A has P0, P1; B has P2', note: 'The partitions are divided between the two.' },
        { from: 1, to: 2, label: 'you own P2, start at offset 40', dashed: true, note: 'B starts from the **committed offset** for P2, exactly where A had got to. Nothing is skipped.' },
        { from: 1, to: 0, label: 'resume P0, P1', dashed: true, note: 'Normal service continues, with the work now split. A crash would trigger the same dance in reverse.' }
      ],
      note: 'Rebalances are normal but not free: while one runs, reading pauses. Newer protocol versions try to reduce the pause.' },

    { kind: 'concept', title: 'Retention and compaction',
      body: `Keeping everything forever would fill the disks, so a topic has a **retention** policy: events older than a set time (commonly a week by default) or beyond a set size are deleted from the **start** of the log.

        A second option is **log compaction**. Instead of "keep the last 7 days", it says **keep the latest event for each key**.

        | Before | After compaction |
        |---|---|
        | cust-7 → address A | cust-9 → address D |
        | cust-9 → address D | cust-7 → address C |
        | cust-7 → address C | |

        Older values for the same key are cleaned up. A topic of "current address per customer" stays small forever, yet a new service can still read it from the start to learn **every customer's current address**. Sending a key with a null value (a "tombstone") acts as a delete.` },

    { kind: 'compare', title: 'Kafka and RabbitMQ, honestly',
      body: 'Neither is "better". They started from different ideas. Engineers also disagree on where to draw the line, as both have grown new features.',
      cols: ['RabbitMQ', 'Kafka'],
      rows: [
        ['Core idea', 'Smart broker routes messages to queues', 'Durable log; readers track their own place'],
        ['After a message is read', 'Removed once acknowledged', 'Kept until retention expires'],
        ['Replay history', 'Not by design', '**Yes**: rewind the offset'],
        ['Routing', '**Rich**: exchanges, patterns, headers', 'Simple: topic and partition by key'],
        ['Ordering', 'Per queue, weakens with many consumers', 'Per partition'],
        ['Great for', 'Task queues, flexible routing', 'Event streams, huge volumes, analytics, many readers'],
        ['Running it', 'Easier to start with', 'More to learn and operate']
      ] },

    { kind: 'pitfall', title: 'Easy ways to get Kafka wrong',
      body: `- **Too few partitions.** A group can use no more consumers than there are partitions. Partitions can be added later, but the key-to-partition mapping then changes, which can disturb per-key order.
        - **A hot key.** If one customer produces half your traffic, that key's partition does half the work however many partitions you have.
        - **Using it as a job queue.** With classic consumer groups, Kafka has no per-message acknowledgement, priorities or "retry this one in ten minutes". If you only need background jobs, a classic queue is simpler.
        - **Ignoring lag.** A consumer falling steadily behind will, in the end, find its bookmark has been **deleted by retention**. Monitor lag.
        - **Using it because it is famous.** A small system rarely needs a log.` }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'In Kafka, once a consumer has read an event, the event is deleted so no other consumer can read it.', answer: false,
      explain: 'Kafka keeps events until retention removes them, whoever has read them. Each consumer group tracks its own offsets, so many readers can read the same events and any can rewind.' },

    { type: 'mcq', after: 5, q: 'A consumer group has 5 consumers reading a topic with 3 partitions. What happens?',
      options: ['3 consumers are active and 2 sit idle', 'All 5 share the work equally', 'Kafka adds two partitions automatically', 'Each partition is read by all 5 at once'],
      answer: 0,
      why: [null, 'A partition goes to one member of a group at a time, so 3 partitions can feed only 3 members.', 'Kafka does not create partitions to fit consumers; you decide the count.', 'That is what separate groups do. Within one group each partition has one reader.'],
      explain: 'Within a group a partition is read by at most one consumer, so the partition count caps useful parallelism. To use 5 consumers you need at least 5 partitions.' },

    { type: 'match', after: 7, prompt: 'Match each Kafka term to its meaning.',
      pairs: [['Topic', 'A named log of events'], ['Partition', 'One ordered slice of a topic'], ['Offset', 'An event’s position within a partition'], ['Consumer group', 'Members that share a topic’s partitions'], ['Lag', 'How far a consumer is behind the end of the log']] },

    { type: 'bucket', prompt: 'Which would you reach for first: RabbitMQ or Kafka?', buckets: ['RabbitMQ', 'Kafka'],
      items: [['Background jobs: send emails, resize photos', 0], ['Route a message by a rich pattern to a few services', 0], ['Per-message retries and a dead-letter shelf', 0], ['A very high-volume clickstream read by many teams', 1], ['Rebuild a report by replaying last month’s events', 1], ['Keep the latest address per customer as a rebuildable table', 1]],
      explain: 'Task queues, rich routing and per-message handling are RabbitMQ’s home ground. Huge event volumes, many independent readers, replay and compaction are what Kafka’s log is for.' },

    { type: 'ab', q: 'Events for the same customer (placed, paid, cancelled) must be processed in order. Which producer is better?',
      a: { lang: 'js', label: 'Key by customer', src: `
        await producer.send({
          topic: 'orders',
          messages: [{ key: order.customerId, value: JSON.stringify(order) }]
        });` },
      b: { lang: 'js', label: 'No key', src: `
        await producer.send({
          topic: 'orders',
          messages: [{ value: JSON.stringify(order) }]
        });` },
      answer: 'a',
      explain: 'The key is hashed to choose a partition, so every event for one customer lands in the same partition, which keeps its order. Without a key, events spread across partitions and the placed, paid and cancelled events can be processed in any order.' },

    { type: 'order', prompt: 'Put a rebalance in order.',
      items: ['A new consumer joins the group', 'Kafka tells the members to pause', 'The partitions are divided between the members', 'Each member is told which partitions it owns', 'Each member resumes from its committed offset'],
      explain: 'A rebalance pauses, re-plans, tells everyone the new plan, and each consumer carries on from the committed offset for its partitions, so nothing is skipped or repeated.' },

    { type: 'cloze', text: 'A topic is split into {{partitions}}, and order is guaranteed only within one {{partition}}. Events with the same {{key}} go to the same one. {{Compaction}} keeps the latest event for each key.',
      distractors: ['offset', 'exchange', 'Retention'],
      explain: 'Partitions give parallelism and ordering inside each one. The key picks the partition. Compaction trims history to the latest value per key, whereas retention trims by age or size.' },

    { type: 'scenario', title: 'Choosing the tool for three jobs', intro: 'You are the architect at a growing marketplace. Three different teams come to you in one week with messaging needs. For each, pick the right tool or setting.',
      meters: { 'fit for purpose': 50, 'running cost': 60 },
      steps: [
        { text: 'The data team wants every page view and click, in huge volume. Fraud, search and analytics all need to read them independently, and want to re-read old data after changing their code. What do you recommend?',
          choices: [
            { label: 'A Kafka topic: events are kept, and each team reads in its own consumer group', score: 2, effects: { 'fit for purpose': 25, 'running cost': -10 }, feedback: 'Volume, independent readers and replay: all the things the log was built for. The extra operations work is justified here.' },
            { label: 'A RabbitMQ queue that all three teams read from', score: 0, effects: { 'fit for purpose': -25 }, feedback: 'They would compete for messages, so each team sees a third of the clicks, and nothing could be re-read once acknowledged.' },
            { label: 'RabbitMQ with a fanout exchange and a queue per team', score: 1, effects: { 'fit for purpose': 5, 'running cost': -5 }, feedback: 'Each team gets a full copy and it would work at modest volume. But there is no replay, and queues pile up at high volume.' }
          ] },
        { text: 'The support team wants “send a follow-up email, retry if the mail server is down, and set aside any that keep failing”. A few hundred a day. What do you recommend?',
          choices: [
            { label: 'A classic queue such as RabbitMQ, with acks and a dead-letter queue', score: 2, effects: { 'fit for purpose': 20, 'running cost': 15 }, feedback: 'A small background-job workload with per-message retry and dead-lettering. A simple queue does exactly this, with far less to run.' },
            { label: 'A Kafka topic, because it is more scalable', score: 1, effects: { 'fit for purpose': -5, 'running cost': -25 }, feedback: 'It could be made to work, but you would build retry and dead-letter handling yourself and run a cluster for a few hundred jobs a day.' },
            { label: 'Skip messaging and send the email inside the web request', score: 0, effects: { 'fit for purpose': -15 }, feedback: 'The user waits on the mail server, and when it is down the whole request fails.' }
          ] },
        { text: 'A new recommendations service must start with the current delivery address of every customer, then stay up to date as addresses change. The topic of address changes is huge and old. How should it be configured?',
          choices: [
            { label: 'Make it a compacted topic keyed by customer id', score: 2, effects: { 'fit for purpose': 25, 'running cost': 10 }, feedback: 'Compaction keeps the latest address per customer indefinitely, so the new service reads from the start and ends up with every customer’s current address, at a fraction of the size.' },
            { label: 'Keep seven days of retention', score: 0, effects: { 'fit for purpose': -25 }, feedback: 'Customers who have not changed address in a week would simply vanish from the topic.' },
            { label: 'Keep everything forever with no compaction', score: 1, effects: { 'fit for purpose': 5, 'running cost': -20 }, feedback: 'Correct but wasteful: storage grows without limit, and new readers must replay every old address.' }
          ] }
      ],
      outro: 'The pattern: **a queue for jobs, a log for events. Choose by what you need to keep, replay and share.**' },

    { type: 'explain', prompt: 'Explain to a colleague how Kafka differs from a traditional message queue, including what partitions and consumer groups do.',
      model: 'A traditional queue removes a message once it is acknowledged. Kafka keeps events in an append-only log until retention expires, and each consumer group tracks its own offset, so many readers can read the same events and replay them. A topic is split into partitions, each an ordered log; order is guaranteed only within a partition, and a key sends related events to the same one. Within a consumer group each partition is read by one member, so the group shares the work, while different groups each get every event.',
      keywords: ['log', 'retention', 'offset', 'partition', 'order', 'key', 'consumer group', 'replay'] }
  ],

  flashcards: [
    { q: 'What is the core idea of Kafka?', a: 'A durable, append-only log. Events are kept (until retention) rather than deleted when read, and each reader tracks its own offset.' },
    { q: 'What are topics, partitions and offsets?', a: 'A topic is a named log; it is split into partitions, each an ordered log; an offset is an event’s position within its partition.' },
    { q: 'Where does Kafka guarantee ordering?', a: 'Only within a single partition. Using the same key for related events sends them to the same partition.' },
    { q: 'How do consumer groups and rebalancing work?', a: 'Each partition is read by one member of a group, so groups share work and every group sees all events. When members join or leave, partitions are redistributed (a rebalance).' },
    { q: 'What are retention and compaction?', a: 'Retention deletes old events by age or size. Compaction keeps only the latest event for each key.' },
    { q: 'When might you choose RabbitMQ over Kafka?', a: 'For task queues, rich routing and per-message acks, retries and dead-lettering, especially at modest volume.' }
  ],

  glossary: [
    { term: 'Kafka', def: 'A distributed event-streaming platform built around a durable, partitioned, append-only log.', like: 'A shop ledger that many people read at once.', aka: ['Apache Kafka'] },
    { term: 'Partition', def: 'One ordered, append-only slice of a topic. Partitions let a topic spread across machines and be read in parallel.', like: 'One volume of a multi-volume ledger.' },
    { term: 'Offset', def: 'The position of an event within a partition. Consumers commit offsets to remember how far they have read.', like: 'A line number in the ledger.' },
    { term: 'Rebalance', def: 'The re-division of a topic’s partitions among the members of a consumer group when members join, leave or fail.', like: 'Shuffling shifts when a colleague arrives or goes home sick.' },
    { term: 'Retention', def: 'The policy that deletes old events from a topic after a set time or size.', like: 'Throwing away the oldest pages of a diary after a year.' },
    { term: 'Log compaction', def: 'A cleanup mode that keeps only the most recent event for each key, so the topic always holds the latest value per key.', like: 'Keeping only each customer’s newest address card.' }
  ],

  takeaways: [
    'Kafka is a **log**: events are appended, **kept**, and read at each consumer’s own pace via **offsets**.',
    'Topics split into **partitions**. **Order holds within a partition**; a **key** keeps related events together.',
    '**Consumer groups** divide partitions among members (a **rebalance** re-divides them); each group sees everything.',
    '**Retention** trims by age or size; **compaction** keeps the latest per key. Kafka is for **streams**, RabbitMQ for **jobs and routing**.'
  ],

  links: [
    { label: 'Apache Kafka documentation', url: 'https://kafka.apache.org/documentation/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('messaging', {
  title: 'The Backlog Beast',
  intro: 'A beast grows with every message left unprocessed, and it only fears the right queue in the right place. Defeat it by choosing patterns, guarantees and brokers wisely.',
  questions: [
    { type: 'mcq', q: 'The email service is down for an hour while customers keep checking out. With a queue between checkout and email, what happens?',
      options: ['Checkout carries on and the emails are sent later', 'Checkout fails for an hour', 'The emails are lost because nobody consumed them', 'Customers must retry their orders'],
      answer: 0,
      why: [null, 'That is the tightly coupled design a queue exists to avoid.', 'The broker stores messages until they are consumed and acknowledged.', 'The order itself succeeded. Only the follow-up work is delayed.'],
      explain: 'The queue decouples producer and consumer in time, so an outage becomes a delay rather than a failure.' },

    { type: 'estimate', q: 'A queue has 3,000 waiting messages. Consumers handle 150 a minute and 50 new ones arrive each minute. About how long until it empties?',
      answer: 30, unit: 'minutes', tolerance: 1.5,
      explain: 'The backlog shrinks by 150 − 50 = **100 a minute**, so 3,000 ÷ 100 = **30 minutes**.' },

    { type: 'bucket', prompt: 'Queue, pub/sub or log (stream)?', buckets: ['Queue', 'Pub/sub', 'Stream (log)'],
      items: [['Resize each uploaded photo exactly once', 0], ['Each of five services needs every “order placed” event', 1], ['A new service must read all events since launch', 2], ['Spread invoice generation across several workers', 0], ['Rebuild a report by replaying a month of events', 2], ['Broadcast a price change to every subscriber', 1]],
      explain: 'One job for one worker is a queue. Several services wanting each event is pub/sub. Keeping history for late joiners and replay is a stream.' },

    { type: 'tf', statement: 'In at-least-once delivery, a consumer acknowledges a message before doing the work, to be sure it is not lost.', answer: false,
      explain: 'Acknowledging **before** the work is at-most-once: a crash loses the job. At-least-once acknowledges **after** the work, so a crash leads to redelivery.' },

    { type: 'spot', prompt: 'Tap the line that makes this consumer unsafe against duplicate deliveries.',
      code: { lang: 'js', src: `
        queue.consume('deposits', async (msg) => {
          await db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?',
            [msg.amount, msg.accountId]);
          msg.ack();
        });` },
      lines: [2, 3],
      explain: 'The update **adds** the amount every time it runs, so a redelivered message is applied twice. An idempotent version records the message id and ignores a repeat, in the same transaction as the change.' },

    { type: 'multi', q: 'Which can cause messages to be processed out of order?',
      options: ['Several consumers working in parallel', 'A failed message being redelivered after later ones', 'Messages spread over several partitions', 'Using a single queue with a single consumer', 'Acknowledging after the work instead of before'],
      answers: [0, 1, 2],
      explain: 'Parallel work, redelivery and multiple partitions or queues all weaken ordering. A single queue with a single consumer keeps order, and the ack position does not reorder anything.' },

    { type: 'ab', q: 'Which design makes sure every “order placed” event reaches both billing and email?',
      a: { lang: 'text', label: 'Own queue each', src: `
        topic  orders.placed
          -> queue billing-orders  -> billing
          -> queue email-orders    -> email` },
      b: { lang: 'text', label: 'Shared queue', src: `
        queue  order-events
          -> billing
          -> email` },
      answer: 'a',
      explain: 'With a shared queue, billing and email compete, and each sees only about half the events. Giving each service its own queue (or consumer group) off the same topic gives both a full copy.' },

    { type: 'match', prompt: 'Match each RabbitMQ idea to its meaning.',
      pairs: [['Exchange', 'Receives messages and routes them to queues'], ['Binding', 'A rule linking an exchange to a queue'], ['orders.#', 'Matches orders. followed by zero or more words'], ['Fanout', 'Copies to every bound queue, ignoring the key'], ['Prefetch', 'Limits unacknowledged messages per consumer']] },

    { type: 'order', prompt: 'Put a poison message’s journey in order.',
      items: ['The consumer receives the message and fails', 'The broker redelivers it, and it fails again', 'The retry limit is reached', 'The message is moved to the dead-letter queue', 'A person inspects it, fixes the cause and replays it'],
      explain: 'Retries are capped so a message that can never succeed cannot loop forever. Setting it aside keeps the main queue flowing, and a human closes the loop.' },

    { type: 'mcq', q: 'A Kafka topic has 4 partitions and a consumer group with 6 members. How many members receive events?',
      options: ['4, because each partition goes to one member', '6, because every member gets a share', 'All 6, each receiving every event', '2, because the extras take over the work'],
      answer: 0,
      why: [null, 'A partition is read by at most one member of a group, so 4 partitions can feed only 4 members.', 'Every member receiving every event is what separate groups do, not members of one group.', 'Extra members are idle standbys until one fails, not workers.'],
      explain: 'Partition count caps the useful parallelism of a group. The two extra members wait idle and take over if another member fails.' },

    { type: 'cloze', text: 'In Kafka, a topic is split into {{partitions}}, a reader’s position is an {{offset}}, and a {{key}} keeps related events in the same partition so their order is kept. {{Compaction}} keeps the latest event per key.',
      distractors: ['exchange', 'binding', 'prefetch'],
      explain: 'Partitions, offsets and keys are Kafka’s core vocabulary. Exchanges, bindings and prefetch belong to RabbitMQ.' },

    { type: 'short', q: 'What do we call a message that fails every time it is retried?', accept: ['poison message', 'poison', 'a poison message', 'poison messages', 'poison pill'], hint: 'Think of what it does to the queue.',
      explain: 'A **poison message** can never succeed, such as malformed data. Cap the retries and move it to a dead-letter queue.' }
  ]
});

KS.sheet('messaging', {
  title: 'Messaging & event streaming cheat sheet',
  sections: [
    { title: 'Why queues', md: `A broker sits between **producers** and **consumers**.

- **Decouple in time:** the consumer can be down or slow.
- **Level load:** spikes wait in the queue and drain.
- **Retry safely:** a message stays until it is **acknowledged**.
- Wrong tool when the caller needs the answer now, or the system is tiny.
- Drain time = backlog ÷ (processing rate − arrival rate).` },

    { title: 'Three patterns', md: `| Pattern | Who gets a message | Kept after read? |
|---|---|---|
| Queue (competing consumers) | One consumer | No |
| Pub/sub (fan-out) | Every subscriber, own copy | No |
| Stream (log) | Every consumer group | **Yes**, until retention |

Mistake: two **different** services on one queue. They split the messages. Give each its own queue or group.` },

    { title: 'Delivery guarantees', md: `| Guarantee | Ack | Risk |
|---|---|---|
| At most once | before work | lost messages |
| At least once | after work | duplicates |
| Exactly once | cannot be guaranteed | build **effectively-once** |

**Effectively-once** = at-least-once + **idempotent consumer** (remember message ids; work and record in one transaction).` },

    { title: 'Ordering and failure', md: `- Order holds only **within one queue or partition**.
- Broken by parallel consumers, redelivery, multiple partitions.
- Keep related messages together (a **key**) or add sequence numbers.
- **Poison message:** always fails. Cap retries, move to a **dead-letter queue**, alert on it, fix, replay.
- Back off between retries.` },

    { title: 'RabbitMQ', md: `Producer → **exchange** (+ routing key) → **bindings** → **queues** → consumers.

| Exchange | Routes by |
|---|---|
| Direct | exact key match |
| Topic | patterns: \`*\` one word, \`#\` zero or more |
| Fanout | every bound queue |
| Headers | message headers |

Manual acks, small **prefetch**, **durable** queues + **persistent** messages + confirms. Unroutable messages are dropped by default.` },

    { title: 'Kafka', md: `- **Topic** → **partitions** (ordered logs) → **offsets**.
- Order only **within a partition**; same **key** → same partition.
- **Consumer group:** one member per partition. Members above the partition count sit idle.
- **Rebalance:** partitions re-divided when members join or leave.
- **Retention:** delete by age or size. **Compaction:** keep the latest per key.
- Watch consumer **lag**.` },

    { title: 'Kafka vs RabbitMQ', md: `| | RabbitMQ | Kafka |
|---|---|---|
| Idea | Smart routing to queues | Replayable log |
| After read | Removed on ack | Kept until retention |
| Strength | Task queues, routing | Streams, volume, many readers |
| Replay | Not by design | Yes |

Choose by need: jobs and routing, or events and history. Do not pick Kafka just because it is famous.` }
  ]
});

