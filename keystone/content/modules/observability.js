/* Module: observability — Observability.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs observability */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-why', {
  eli5: 'Monitoring tells you that something is broken. Observability means your system gives out enough clues that you can work out why, even for a problem nobody predicted.',

  cards: [
    { kind: 'story', title: '3am: the alarm that says nothing useful',
      body: `Your phone buzzes. The alert says: **"Checkout error rate above 5%."**

        Good: you know something is wrong. But you know almost nothing else. Is it every user, or only people on one phone? One country? One payment provider? Since the last release, or since the database filled up? Which of the dozen services behind checkout is actually at fault?

        The alert answered "**is** it broken?". You now need to answer "**why?**", fast, while customers fail to pay. The difference between those two questions is what this module is about.` },

    { kind: 'concept', title: 'Monitoring vs observability',
      body: `**Monitoring** is watching for problems you already thought of. You pick things to measure (error rate, CPU, disk space), draw them on dashboards and set alarms when they go wrong.

        **Observability** is a property of the system: *how well can you understand what is happening inside it, just from what it puts out?* If you can ask a **brand-new question** about a live system ("which customers on version 3.2 are slow, and where?") and get an answer *without shipping new code*, the system is observable.

        Monitoring is a set of questions asked in advance. Observability lets you ask the questions you only think of **during** the incident.` },

    { kind: 'metaphor', title: 'The warning light and the diagnostic plug',
      body: `Your car's dashboard has a **check-engine light**. It is monitoring: something is wrong. It cannot tell you what.

        A mechanic plugs a diagnostic computer into the car and reads detailed data from dozens of sensors: fuel mix, temperatures, error codes. Now they can find out *why* the light came on, even for a fault the designers never specifically listed.

        A system needs both: the light that grabs your attention, and the detailed data underneath so you can investigate. Observability is building in the diagnostic plug **before** the breakdown.

        Where the metaphor stops: a car is built once. Software changes daily, so the sensors must keep up.` },

    { kind: 'compare', title: 'Known unknowns vs unknown unknowns',
      body: 'Systems fail in ways you predicted and ways you did not. Different tools suit each.',
      cols: ['Known unknowns', 'Unknown unknowns'],
      rows: [
        ['The question', '"How full is the disk?" You know to ask.', '"Why is it slow only for some users?" You did not know to ask.'],
        ['Tool', 'A prepared dashboard and an alert', 'Exploring detailed data: filter, group, drill down'],
        ['Setup', 'Decide the measurements in advance', 'Record rich detail now, decide the questions later'],
        ['Example', 'Disk space is at 90%', 'A new app version fails only on one phone model']
      ],
      note: 'As systems get split into many services (microservices, which come later in the course), the unknown unknowns multiply. That is why observability became a topic of its own.' },

    { kind: 'diagram', title: 'The three pillars',
      body: 'A running system gives off three kinds of signal. Together they let you work out what happened.',
      nodes: [
        { id: 'app', label: 'Your running system', icon: '🖥️', x: 1, y: 0 },
        { id: 'logs', label: 'Logs', icon: '📜', x: 0, y: 1, tone: 'accent' },
        { id: 'met', label: 'Metrics', icon: '📈', x: 1, y: 1, tone: 'good' },
        { id: 'tr', label: 'Traces', icon: '🧵', x: 2, y: 1, tone: 'info' },
        { id: 'why', label: 'Understanding: why?', icon: '💡', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'app', to: 'logs' }, { from: 'app', to: 'met' }, { from: 'app', to: 'tr' },
        { from: 'logs', to: 'why' }, { from: 'met', to: 'why' }, { from: 'tr', to: 'why' }
      ],
      caption: '**Logs**: a diary of individual events. **Metrics**: numbers over time. **Traces**: the journey of one request through many services. Each has its own lesson in this module.' },

    { kind: 'compare', title: 'What each pillar is good at',
      cols: ['Answers', 'Strength', 'Weakness'],
      rows: [
        ['Metrics', '"Is something wrong? How bad? Since when?"', 'Cheap, fast, great for alerts and trends', 'Aggregated: cannot tell you about one request'],
        ['Logs', '"What exactly happened in this event?"', 'Rich detail, free-form context', 'Bulky and expensive; hard to search without structure'],
        ['Traces', '"Where did this request spend its time?"', 'Shows the path across services', 'Needs wiring through every service; usually sampled']
      ],
      note: 'A typical investigation: a metric alerts you, a trace shows the slow hop, logs from that hop explain the cause.' },

    { kind: 'pitfall', title: 'Collecting data is not the same as understanding',
      body: `Teams often drown in telemetry and are still blind. Common traps:

        - **Dashboard sprawl.** Sixty graphs, none of which answers "is the customer happy?"
        - **Data with no context.** A log line that says \`error\` with no request ID, user or service is noise.
        - **Hoarding.** Storing everything forever is expensive, and most of it is never read.
        - **Only monitoring the known.** The incidents that hurt are usually the ones nobody predicted.

        The question to keep asking: *"If this broke in a way I have never seen, could I find out why in ten minutes?"*` },

    { kind: 'concept', title: 'Observability is a design goal',
      body: `You cannot bolt observability on the night of an outage. The data you need has to be **emitted by the code**, in advance, in a useful shape.

        That makes it part of design, like testing or security:

        - every request carries an **ID** that follows it everywhere
        - events record *context*: which user tier, which version, which region
        - services report their own health in a standard way
        - the team agrees what "healthy" means *before* anything breaks

        Treat "how will I know why this broke?" as a **requirement** for every new feature, not an afterthought.` },

    { kind: 'steps', title: 'An investigation using all three pillars',
      body: 'Back to our 3am checkout alert. Here is how the pillars work together.',
      steps: [
        { title: 'A metric raises the alarm', body: 'Error rate on checkout jumps from 0.2% to 6%. Metrics tell you **that** it is wrong and **when it started**: ten minutes ago.' },
        { title: 'Metrics narrow it down', body: 'Split the error rate by version, region and payment provider. Only requests using provider "PayFast" fail. Now you know **where to look**.' },
        { title: 'A trace shows the path', body: 'Open the trace of one failed checkout. Every step is quick except one: the call to PayFast took 30 s and timed out.' },
        { title: 'Logs explain the event', body: 'The logs for that span say "TLS certificate expired". **Why** it broke is found.' },
        { title: 'Act', body: 'Switch to the backup provider using a feature flag, then fix the certificate. Minutes, not hours.' }
      ] }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each idea to what it means.',
      pairs: [['Monitoring', 'Watching for problems you predicted'], ['Observability', 'Being able to ask new questions of a live system'], ['Known unknown', 'You know what to ask but not the answer'], ['Unknown unknown', 'A failure you did not know to look for']],
      explain: 'Monitoring covers the questions you prepared. Observability is about the questions you only think of during the incident.' },

    { type: 'bucket', after: 5, prompt: 'Which pillar is the best first tool for each question?',
      buckets: ['Metrics', 'Logs', 'Traces'],
      items: [['Is the error rate higher than usual today?', 0], ['What was the exact error message for order 8841?', 1], ['Which of the six services made this request slow?', 2], ['How many requests per second are we serving?', 0], ['What did the payment provider reply for this one failure?', 1], ['What was the path of one request across services?', 2]],
      explain: 'Metrics are aggregated numbers for "how much, how often". Logs are details of one event. Traces show how one request moved through services.' },

    { type: 'tf', statement: 'Dashboards for CPU, memory and disk are monitoring; on their own they do not make a system observable.', answer: true,
      explain: 'Those are known measurements chosen in advance, which is monitoring. Observability means you can answer new, unplanned questions about behaviour, like why requests are slow only for one group of users.' },

    { type: 'mcq', q: 'Your alert says checkout errors are up. Which next step uses observability, rather than just monitoring?',
      options: ['Slice failed requests by version and region to see what they share', 'Check that the alert is still firing', 'Raise the alert threshold so it stops waking people', 'Restart all services to see if it helps'],
      answer: 0,
      why: [null, 'That only repeats what you already know.', 'Silencing the alarm removes the signal without finding the cause.', 'Restarting is guessing. It may help by accident but teaches you nothing.'],
      explain: 'Observability lets you slice detailed data in ways you did not plan for. Grouping by version, region and provider quickly shows which factor the failures share.' },

    { type: 'order', prompt: 'Put this investigation in a sensible order.',
      items: ['A metric alert fires: checkout errors are high', 'Break the metric down by region and provider to find the pattern', 'Open a trace of one failing request to find the slow step', 'Read the logs from that step to see the exact error', 'Fix or work around the cause'],
      explain: 'Go from wide to narrow: alert, pattern, path, detail, fix. Each signal answers a different question.' },

    { type: 'multi', q: 'Which of these make a system harder to observe?',
      options: ['Log lines with no request ID or context', 'A dashboard with sixty unlabelled graphs', 'Services that each report health in their own format', 'Every request carrying a trace ID through every service', 'Recording version and region on every event'],
      answers: [0, 1, 2],
      explain: 'Missing context, unfocused dashboards and inconsistent signals all slow you down. IDs and context on every event are what make investigation fast.' },

    { type: 'scenario', title: 'The mystery slowdown', intro: 'Support says "the site feels slow" but your dashboards (CPU, memory, error rate) all look normal. Customers are starting to complain.',
      meters: { 'customer trust': 60, 'time to answer': 70, cost: 60 },
      steps: [
        { text: 'Everything on your dashboards is green. What is your next move?',
          choices: [
            { label: 'Look at latency by endpoint and customer segment to see who is slow', score: 2, effects: { 'time to answer': 10, 'customer trust': 5 }, feedback: 'The problem is outside what you pre-planned, so you explore. Latency split by endpoint and segment narrows it to the checkout page for mobile users.' },
            { label: 'Tell support that the system is healthy, since all graphs are green', score: 0, effects: { 'customer trust': -20 }, feedback: 'Green dashboards only prove the things you chose to measure are fine. Customers are the real test.' },
            { label: 'Add more CPU and memory just in case', score: 0, effects: { cost: -20, 'time to answer': -10 }, feedback: 'Resources were not the problem, so you paid for nothing.' }
          ] },
        { text: 'It is mobile checkout. You open a trace of a slow mobile request. What does the trace give you that the metric did not?',
          choices: [
            { label: 'The path across services and which step took the time', score: 2, effects: { 'time to answer': 20 }, feedback: 'A trace breaks one request into steps. Here the "address lookup" call takes 4 seconds, but only the mobile app calls it.' },
            { label: 'The total error count for the day', score: 0, effects: { 'time to answer': -5 }, feedback: 'That is a metric, and you already had it.' },
            { label: 'Nothing, traces are only for errors', score: 1, effects: {}, feedback: 'Traces are mostly used to find where *time* goes, even when nothing is failing.' }
          ] },
        { text: 'The fix ships. What do you do so the next unknown problem is quicker to find?',
          choices: [
            { label: 'Add the client type and app version to every request’s recorded context', score: 2, effects: { 'customer trust': 15, 'time to answer': 15 }, feedback: 'Rich context lets you slice by new factors next time without writing new code. That is observability as a design goal.' },
            { label: 'Add a "mobile checkout" dashboard and consider the job done', score: 1, effects: { 'time to answer': 5 }, feedback: 'It helps with this one problem, but it is a known unknown now. The next surprise will be different.' },
            { label: 'Do nothing, it is fixed', score: 0, effects: { 'customer trust': -5 }, feedback: 'You will be blind in the same way next time.' }
          ] }
      ],
      outro: 'The skill: **alert on what you know, investigate with rich data for what you do not.**' },

    { type: 'cloze', text: 'The three pillars are {{logs}}, {{metrics}} and {{traces}}. A metric tells you {{that}} something is wrong; the other signals help you find out {{why}}.',
      distractors: ['alerts', 'dashboards'],
      explain: 'Logs are events, metrics are numbers over time, traces follow one request. Alerts and dashboards are ways of looking at signals, not signals themselves.' },

    { type: 'short', q: 'Which of the three pillars shows the journey of a single request across many services?', accept: ['traces', 'trace', 'tracing', 'distributed tracing', 'distributed traces'], hint: 'It is named after a trail left behind.',
      explain: '**Traces** follow one request as it hops from service to service, showing how long each step took.' }
  ],

  flashcards: [
    { q: 'Monitoring vs observability?', a: 'Monitoring watches for problems you predicted. Observability is how well you can understand the inside of a system from its outputs, including for unpredicted problems.' },
    { q: 'What are the three pillars of observability?', a: 'Logs (individual events), metrics (numbers over time) and traces (one request across services).' },
    { q: 'Known unknowns vs unknown unknowns?', a: 'Known unknowns are questions you know to ask (disk full?). Unknown unknowns are problems you did not predict, found only by exploring rich data.' },
    { q: 'What does each pillar answer best?', a: 'Metrics: is something wrong and how much? Traces: where did the time go? Logs: what exactly happened here?' },
    { q: 'Why must observability be designed in?', a: 'The data has to be emitted by the code in advance. You cannot add useful context after an outage has started.' }
  ],

  glossary: [
    { term: 'Observability', def: 'How well you can understand a system\'s internal state from the data it emits, including answering questions you did not plan for.', like: 'The diagnostic plug on a car.' },
    { term: 'Monitoring', def: 'Collecting and watching predefined measurements and alerting when they cross a threshold.', like: 'The check-engine light.' },
    { term: 'Telemetry', def: 'The data a running system sends out about itself: logs, metrics and traces.', like: 'Readings beamed back from a space probe.' },
    { term: 'Three pillars', def: 'The usual three kinds of telemetry: logs, metrics and traces.' }
  ],

  takeaways: [
    'Monitoring says **that** it is broken. Observability helps you find **why**, even for surprises.',
    'The three pillars: **logs** (events), **metrics** (numbers over time), **traces** (one request across services).',
    'Alert on known problems; keep **rich, contextual data** to explore unknown ones.',
    'Design it in: every request needs IDs and context **before** the outage.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-logs', {
  eli5: 'Logs are the diary your program keeps: a timestamped note for each thing that happens, which is only useful at 3am if the notes are tidy, searchable and free of secrets.',

  cards: [
    { kind: 'story', title: 'Grepping twelve servers at 2am',
      body: `A customer says "my order vanished". You have twelve servers. Each writes a text file of what it did. You log in to the first and search for the customer's name. Nothing. The second. Nothing. The fifth finally shows a line:

        \`Error: something went wrong\`

        Which request? Which user? Why? What happened before and after, on *other* servers? The line cannot tell you.

        **Logs** are the oldest form of observability, and they are only as good as the care that goes into writing them. This lesson is about writing logs your future, sleepy self will thank you for.` },

    { kind: 'metaphor', title: 'The ship’s log and the flight recorder',
      body: `A ship's captain keeps a **log**: a dated entry for each event. "14:02, changed course, wind rising." After an incident, investigators read it to rebuild what happened.

        A plane's flight recorder is the same idea, automated. Nobody reads it on a normal flight. But when something goes wrong, it is priceless.

        An application log is both: each event gets a time and a description, written down continuously, and almost all of it is never read. Its value is concentrated in the one bad hour. So the question is always: *will this entry help someone reconstruct what happened?*` },

    { kind: 'code', title: 'Unstructured vs structured',
      body: `The same event, logged two ways. The first is for humans to squint at; the second is for humans **and** machines.`,
      code: { lang: 'json', src: `
        // unstructured: a sentence
        Order 8841 failed for alice@example.com: card declined

        // structured: named fields
        {"time":"2025-03-02T14:03:11Z","level":"warn","service":"checkout",
         "event":"payment_declined","order_id":8841,"user_id":"u_192",
         "provider":"payfast","reason":"card_declined","request_id":"r-7f3a"}`,
        notes: {
          2: 'Easy to read, hard to search. To find all declines for one provider you would have to write fragile text-matching rules, and the wording will change.',
          5: 'A **structured log** is one JSON object per line. Every fact has a name.',
          6: 'Now a tool can filter "all `payment_declined` events where `provider` is `payfast`" and count them by hour. It also records an ID, not the email address (more on that soon).',
          7: 'The `request_id` ties this line to every other line caused by the same request. That is next.'
        } } },

    { kind: 'compare', title: 'Log levels: how loud is this?',
      body: 'Levels let you keep the volume manageable: in production you usually record INFO and above, and turn DEBUG on only when investigating.',
      cols: ['Meaning', 'Example'],
      rows: [
        ['DEBUG', 'Detail for developers; very noisy', 'Cache lookup for key user:42 missed'],
        ['INFO', 'Normal, notable events', 'Order 8841 placed'],
        ['WARN', 'Odd but handled; worth a look in bulk', 'Payment provider slow, used retry'],
        ['ERROR', 'An operation failed', 'Could not save order 8842'],
        ['FATAL', 'The process cannot continue', 'Database unreachable at start-up']
      ],
      note: 'Do not log every error as ERROR: a user typing a wrong password is normal and should be INFO or WARN. If everything is an error, nothing is.' },

    { kind: 'sequence', title: 'Correlation IDs: one request, many logs',
      body: 'A single click can touch many services, each writing its own logs. How do you gather the right lines? Give the request a name tag.',
      actors: ['Browser', 'Gateway', 'Orders', 'Payments'],
      steps: [
        { from: 0, to: 1, label: 'POST /checkout', note: 'The request arrives at the edge.' },
        { at: 1, label: 'make id r-7f3a', note: 'The gateway invents a unique **request ID** (also called a **correlation ID**) if the request does not have one.' },
        { from: 1, to: 2, label: 'X-Request-ID: r-7f3a', note: 'It passes the ID along in a **header**. By convention, many systems use `X-Request-ID`.' },
        { from: 2, to: 3, label: 'X-Request-ID: r-7f3a', note: 'Each service forwards the same ID to the next.' },
        { at: 3, label: 'log {request_id: r-7f3a, …}', note: 'Every log line, in every service, includes the ID.' },
        { note: 'Later: search the central log store for `request_id = r-7f3a` and you see the **whole story across all services, in order**. Return the ID to the user in error pages too, so support can quote it.' }
      ] },

    { kind: 'diagram', title: 'Centralised logging',
      body: 'Servers come and go (and containers vanish in seconds, taking their log files with them). So logs are shipped to one searchable place.',
      nodes: [
        { id: 'a', label: 'App servers (many)', icon: '🖥️', x: 1, y: 0 },
        { id: 's', label: 'Log shipper / agent', icon: '🚚', x: 1, y: 1 },
        { id: 'p', label: 'Pipeline: parse, filter', icon: '🧹', x: 1, y: 2, tone: 'accent' },
        { id: 'st', label: 'Log store + search', icon: '🗄️', x: 1, y: 3, tone: 'good' },
        { id: 'u', label: 'You, at 3am', icon: '🔍', x: 1, y: 4 }
      ],
      edges: [
        { from: 'a', to: 's', label: 'write to stdout' }, { from: 's', to: 'p', label: 'ship' },
        { from: 'p', to: 'st', label: 'index' }, { from: 'u', to: 'st', label: 'query', dashed: true }
      ],
      caption: 'Apps simply write to standard output; an agent collects it. Well-known stacks include Elasticsearch with Kibana, and Grafana Loki, plus the logging services of cloud providers.' },

    { kind: 'pitfall', title: 'Never log secrets or personal data',
      body: `Logs are copied everywhere: shipped, indexed, backed up, read by many people and sometimes sent to third parties. **Anything you log, you now have to protect.**

        Never write these to a log:

        - passwords, session tokens, API keys, JWTs (you met these in the security lessons)
        - full card numbers or card security codes
        - personal data such as full email, address, health details. Use an internal user ID instead.
        - whole request bodies "just in case"

        Prefer an **allow-list** (log only named fields) to "log everything, scrub later". Privacy laws such as GDPR apply to logs too, and so does the "right to be forgotten".` },

    { kind: 'tip', title: 'Logging with a budget',
      body: `Logs are the most expensive pillar to keep, because they are verbose. Habits that help:

        - Log at **boundaries**: a request arrived, a call to another service finished, a decision was made. Not inside tight loops.
        - Log **events with context**, not play-by-play commentary.
        - Set **retention**: keep hot, searchable logs for days or weeks, archive cheaply for longer, then delete.
        - Turn DEBUG on **temporarily** and narrowly (one service, one user), not everywhere.
        - Make sure log lines can **never block** the app: write asynchronously.`,
      note: 'Rule of thumb: if no one will ever search for it, do not write it. If a *metric* would answer the question more cheaply (like "how many declines per minute"), count it instead of logging each one. That is the next lesson.' }
  ],

  activities: [
    { type: 'ab', after: 2, q: 'Which log line is more useful at 3am?',
      a: { lang: 'json', label: 'A sentence', src: `
        Payment failed for order 8841 (card declined)` },
      b: { lang: 'json', label: 'Named fields', src: `
        {"event":"payment_declined","order_id":8841,
         "reason":"card_declined","request_id":"r-7f3a"}` },
      answer: 'b',
      explain: 'Named fields can be filtered, counted and joined with other lines by request ID. A sentence can only be read by eye or matched with fragile text patterns.' },

    { type: 'match', after: 3, prompt: 'Match each log level to the right situation.',
      pairs: [['DEBUG', 'A detailed step that only matters when investigating'], ['INFO', 'A normal, notable event such as an order placed'], ['WARN', 'Something odd that the system handled'], ['ERROR', 'An operation failed and needs attention'], ['FATAL', 'The process cannot carry on']],
      explain: 'Levels let you filter noise: production usually records INFO and above, with DEBUG switched on only when needed.' },

    { type: 'mcq', after: 4, q: 'A request passes through five services. What lets you pull up every log line it produced?',
      options: ['One request ID, passed along and written in every log line', 'Sorting all logs by timestamp across the whole company', 'Logging the user’s email address in each service', 'Giving each service its own log file'],
      answer: 0,
      why: [null, 'Thousands of requests share the same seconds, so timestamps alone cannot separate them.', 'Emails are personal data and may be the same for many requests.', 'Separate files make it harder to follow one request across services.'],
      explain: 'The same ID on every line, in every service, makes one search return the whole story of one request.' },

    { type: 'spot', prompt: 'This code logs a login attempt. Tap the line that creates a security and privacy problem.',
      code: { lang: 'js', src: `
        function login(req, res) {
          const { email, password } = req.body;
          logger.info('login attempt', {
            requestId: req.id,
            email: email,
            password: password
          });
          return authenticate(email, password);
        }` },
      lines: [6],
      explain: 'Logging the password writes a secret in plain text to logs that many people and tools can read. Never log credentials. Even the email is personal data, so prefer a user ID once you know it.' },

    { type: 'multi', q: 'Which of these should never go into a log line?',
      options: ['A user’s password', 'A session token or API key', 'A full credit card number', 'The order ID', 'The name of the endpoint called'],
      answers: [0, 1, 2],
      explain: 'Credentials, tokens and card numbers are secrets. IDs and endpoint names are the harmless context that makes logs useful.' },

    { type: 'bucket', prompt: 'Which log level fits best?',
      buckets: ['DEBUG / INFO', 'WARN', 'ERROR / FATAL'],
      items: [['User opened the pricing page', 0], ['Payment provider took 4 s; retry succeeded', 1], ['Could not save an order to the database', 2], ['Cache miss for one key', 0], ['A user typed the wrong password once', 1], ['Cannot connect to the database at start-up: exiting', 2]],
      explain: 'INFO and DEBUG describe normal behaviour. WARN is for odd-but-handled situations. ERROR means a real failure, and FATAL means the process cannot continue.' },

    { type: 'estimate', q: 'A service handles 500 requests per second and writes 5 log lines of about 300 bytes per request. Roughly how many gigabytes of logs per day is that?',
      answer: 65, unit: 'GB per day', tolerance: 1.5, min: 0.1, max: 100000,
      explain: '500 × 5 × 300 bytes = 750,000 bytes per second. A day is 86,400 seconds, so about 65 billion bytes: 65 GB per day, from just one service. This is why logging has a budget.' },

    { type: 'scenario', title: 'The vanishing order', intro: 'A customer says their order disappeared. You have five services and thousands of log lines per second. The customer sends you the order confirmation email.',
      meters: { 'customer trust': 60, 'time to answer': 70, privacy: 90 },
      steps: [
        { text: 'You have the order number and an approximate time. What is the quickest way to find what happened?',
          choices: [
            { label: 'Search the central logs for the request ID tied to that order, across all services', score: 2, effects: { 'time to answer': 15, 'customer trust': 5 }, feedback: 'One search returns every line from every service, in order. You can see the request reached Payments but never reached Fulfilment.' },
            { label: 'SSH into each server and grep text files', score: 0, effects: { 'time to answer': -25 }, feedback: 'Slow, and containers may already have been replaced, taking their logs with them.' },
            { label: 'Ask the customer to try again and watch', score: 1, effects: { 'customer trust': -10 }, feedback: 'You might reproduce it, but you gave up evidence you already had.' }
          ] },
        { text: 'The logs show an error but the line only says "failed". Which change gives the most for the future?',
          choices: [
            { label: 'Log named fields: event, order ID, reason and request ID', score: 2, effects: { 'time to answer': 10 }, feedback: 'Structure and context turn "failed" into "fulfilment_publish_failed, queue unreachable, request r-7f3a".' },
            { label: 'Log everything at DEBUG all the time', score: 0, effects: { 'time to answer': -5 }, feedback: 'You would drown in noise and pay for storage, and finding the useful line gets harder, not easier.' },
            { label: 'Log the whole request body, including the card details', score: 0, effects: { privacy: -40, 'customer trust': -15 }, feedback: 'Now your logs contain secrets and personal data. Anyone with log access, and any log vendor, can read them.' }
          ] },
        { text: 'Support wants to quote something to the customer so engineering can find the problem quickly next time. What do you add?',
          choices: [
            { label: 'Show the request ID on the error page and in the confirmation email footer', score: 2, effects: { 'time to answer': 15, 'customer trust': 10 }, feedback: 'The customer can read out a short ID and you jump straight to the exact request.' },
            { label: 'Ask customers to send a screenshot of their browser', score: 1, effects: { 'time to answer': 5 }, feedback: 'Helpful but slow and not searchable.' },
            { label: 'Nothing: support can guess from the time', score: 0, effects: { 'time to answer': -10 }, feedback: 'At scale, many requests share the same minute.' }
          ] }
      ],
      outro: 'Good logs are **structured, contextual, correlated, central and clean of secrets**.' },

    { type: 'short', q: 'What is the name for a unique ID attached to a request and passed through every service so its logs can be joined up? (two words)', accept: ['correlation id', 'request id', 'correlationid', 'requestid', 'trace id', 'correlation ids', 'request ids', 'correlation identifier', 'request identifier'], hint: 'It correlates log lines to one request.',
      explain: 'A **correlation ID** (or request ID) is generated at the edge, passed in a header and included in every log line.' }
  ],

  flashcards: [
    { q: 'Why use structured logs?', a: 'Named fields (usually JSON) can be filtered, counted and joined by tools. Free-text sentences cannot be searched reliably.' },
    { q: 'What are the usual log levels?', a: 'DEBUG, INFO, WARN, ERROR, FATAL, from chatty detail to "the process cannot continue". Production usually records INFO and above.' },
    { q: 'What is a correlation (request) ID?', a: 'A unique ID created at the edge, passed to every service in a header and written in every log line, so one search returns one request’s whole story.' },
    { q: 'Why centralise logs?', a: 'Servers and containers are temporary and numerous. Shipping logs to one searchable store keeps them after the server is gone and lets you search across services.' },
    { q: 'What must never be logged?', a: 'Passwords, tokens, API keys, full card numbers and unneeded personal data. Prefer an allow-list of fields and IDs instead of emails.' }
  ],

  glossary: [
    { term: 'Log', def: 'A timestamped record of something that happened in a program.', like: 'A ship\'s log, or the diary your system keeps.' },
    { term: 'Structured logging', def: 'Writing each log entry as named fields (such as JSON) instead of a free-text sentence.', like: 'A filled-in form rather than a handwritten note.' },
    { term: 'Log level', def: 'A label (DEBUG, INFO, WARN, ERROR, FATAL) showing how important or noisy an entry is, used to filter logs.' },
    { term: 'Correlation ID', def: 'A unique ID that follows a request through every service so all its log lines can be found together.', like: 'The tracking number on a parcel.', aka: ['request ID'] },
    { term: 'Centralised logging', def: 'Collecting logs from all servers into one place where they can be stored and searched.' }
  ],

  takeaways: [
    'Log **structured events** (named fields), not sentences.',
    'Use **levels** honestly; a **correlation ID** on every line lets you follow one request across services.',
    '**Centralise** logs: servers and containers disappear, and you need one place to search.',
    '**Never log secrets or unneeded personal data**, and budget for volume.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-metrics', {
  eli5: 'Metrics are numbers a system records over time, like requests per second or how long pages take, so you can spot trends and trouble at a glance, as long as you look at the right numbers.',

  cards: [
    { kind: 'concept', title: 'Numbers over time',
      body: `A **metric** is a number, measured regularly, stored with its timestamp. Every 15 seconds your service might record "requests so far: 41,230", then "41,987", then "42,610".

        String those readings together and you get a **time series**: a line on a graph. From it you can see rates, trends, spikes and *when* something changed.

        Metrics are small and cheap. A million requests might produce millions of log lines but still just **a handful of numbers per minute**. That is why alerts, dashboards and capacity planning are built on metrics.

        The price of being tiny is that they are **aggregated**: a metric can tell you the error rate rose, but not which user was affected.` },

    { kind: 'metaphor', title: 'The car dashboard',
      body: `Look at a car dashboard and you will find all three basic kinds of metric:

        - The **odometer** only ever goes up: total distance driven. That is a **counter**.
        - The **fuel gauge** and **speedometer** go up *and* down: the current level right now. That is a **gauge**.
        - Imagine a notebook where you tally every journey into bands: "under 10 minutes: 40 trips, 10 to 30: 25, over 30: 5". That spread of values is a **histogram**.

        Each answers a different kind of question. Choosing the wrong kind is the most common beginner mistake.` },

    { kind: 'compare', title: 'Counters, gauges, histograms',
      cols: ['Behaviour', 'Question it answers', 'Example'],
      rows: [
        ['Counter', 'Only goes up (resets on restart)', 'How many, how fast? (take the rate)', 'Total requests, total errors'],
        ['Gauge', 'Goes up and down', 'How much right now?', 'Queue length, memory used, active connections'],
        ['Histogram', 'Counts values into buckets', 'How are values spread? (gives percentiles)', 'Request duration, response size']
      ],
      note: 'A counter is almost never graphed raw. You graph its **rate of change**: "requests per second" is the difference between two readings, divided by the time between them.' },

    { kind: 'code', title: 'Recording metrics in code',
      body: 'The details differ by library; the shape is always like this (an illustrative client). **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        const requests = metrics.counter('http_requests_total');
        const inFlight = metrics.gauge('http_in_flight');
        const latency = metrics.histogram('http_request_seconds');

        async function handle(req, res) {
          inFlight.inc();
          const start = Date.now();
          try {
            await route(req, res);
          } finally {
            inFlight.dec();
            latency.observe((Date.now() - start) / 1000);
            requests.inc({ route: req.route, status: res.statusCode });
          }
        }`,
        notes: {
          1: 'A **counter**: we will only ever add to it.',
          2: 'A **gauge**: we raise it when a request starts and lower it when it ends, so it always shows "requests being handled right now".',
          3: 'A **histogram**: each duration is dropped into a bucket, so we can later work out percentiles.',
          13: '**Labels** (route, status) slice one metric into many series, so you can ask "errors on `/checkout`". Choose them with care: the next cards explain why.'
        } } },

    { kind: 'pitfall', title: 'Averages lie',
      body: `Say 100 requests arrive. Ninety take 100 ms. Ten take 5,000 ms (five seconds) because of a slow database call.

        | Measure | Value |
        |---|---|
        | Average | 590 ms |
        | Median (p50) | 100 ms |
        | 95th percentile (p95) | 5,000 ms |

        The **average** of 590 ms describes nobody: no request took anywhere near that. The **median** says everything is fine. Only the **p95** shows that one user in ten waits five seconds.

        Averages smooth away the pain. Customers do not experience the average; they experience *their own* request.` },

    { kind: 'concept', title: 'Percentiles, and why the tail matters',
      body: `The **pth percentile** is the value below which p% of requests fall. **p50** is the median: half were faster. **p95**: 95% were faster, the slowest 5% were not. **p99**: only the slowest 1% were slower.

        The slow end is called the **tail**, and it matters more than it seems. One page that makes **20 calls** to other services is slow if *any* of them is slow. If each call is slow just 1% of the time, then:

        1 − 0.99²⁰ ≈ **18%** of page loads hit at least one slow call.

        So a backend's "rare" p99 becomes a common experience once calls multiply. This is why teams track **p95 or p99**, not the average. You will see percentiles again when you set targets for reliability.` },

    { kind: 'compare', title: 'RED and USE: which numbers first?',
      body: 'You cannot graph everything, so two famous checklists tell you where to start.',
      cols: ['RED: for services', 'USE: for resources'],
      rows: [
        ['Thing it covers', 'Anything that serves requests (an API, a web app)', 'Anything with limited capacity (CPU, disk, a connection pool)'],
        ['1st question', '**R**ate: requests per second', '**U**tilisation: how much of it is busy'],
        ['2nd question', '**E**rrors: how many fail', '**S**aturation: how much work is queued or waiting'],
        ['3rd question', '**D**uration: how long they take (percentiles)', '**E**rrors: how many fail']
      ],
      note: 'RED comes from Tom Wilkie, USE from Brendan Gregg. Google\'s SRE book lists a similar set called the four golden signals: latency, traffic, errors and saturation.' },

    { kind: 'pitfall', title: 'Cardinality: the label that ate the budget',
      body: `Every unique combination of label values is its **own time series**, stored and indexed separately. That count is the metric's **cardinality**.

        Take \`http_requests_total\` labelled by \`route\` (50 values) and \`status\` (6 values): 50 × 6 = **300 series**. Fine.

        Now someone adds a \`user_id\` label with 200,000 users: 300 × 200,000 = **60 million series**. The metrics system slows, falls over or sends a very large bill.

        Rule: labels must be **small, bounded sets** (route, method, status, region). Never put IDs, emails, URLs with parameters or timestamps in labels. Per-user detail belongs in logs and traces.` },

    { kind: 'tip', title: 'Dashboards that help',
      body: `A good dashboard answers a question in five seconds. A bad one is a wall of sixty graphs.

        - Put the **RED numbers** for each service at the top, with p95 or p99, not the average.
        - One graph, one question, with a clear title and units.
        - Show **deploy markers**, so a spike lines up with "version 3.2 shipped".
        - Link from a graph to the logs or traces for that moment.
        - Keep a separate "deep dive" dashboard for investigations.

        Do not stare at dashboards all day. **Alerts** should tell you when to look (the last lesson of this module).` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each metric to its type.',
      pairs: [['Total orders placed since launch', 'Counter: it only ever rises'], ['Items in the job queue right now', 'Gauge: it rises and falls'], ['How long each request took', 'Histogram: we care about the spread'], ['Requests per second', 'The rate of change of a counter']],
      explain: 'If it only ever goes up, it is a counter. If it rises and falls, it is a gauge. If you care about the spread of values, use a histogram.' },

    { type: 'estimate', after: 4, q: '99 requests take 100 ms and 1 request takes 10,000 ms (10 s). What is the average latency, in milliseconds?',
      answer: 199, unit: 'ms', tolerance: 1.2, min: 10, max: 20000,
      explain: '(99 × 100 + 10,000) ÷ 100 = 19,900 ÷ 100 = 199 ms. It looks fine, yet one user waited ten seconds. Percentiles expose that, and the average hides it.' },

    { type: 'tf', after: 5, statement: 'Even when the average response time is 200 ms, some users can be waiting several seconds.', answer: true,
      explain: 'An average can hide a long tail: many fast requests and a few very slow ones. That is why you use percentiles (p95, p99) to see what the slowest users get.' },

    { type: 'bucket', prompt: 'RED (for a service) or USE (for a resource)?',
      buckets: ['RED: service', 'USE: resource'],
      items: [['Requests per second to the API', 0], ['CPU utilisation of a server', 1], ['Error rate of the checkout endpoint', 0], ['Disk I/O queue length', 1], ['p95 duration of requests', 0], ['Database connection pool: how many are in use', 1]],
      explain: 'RED describes how a request-serving service is behaving for its users. USE describes how busy and how backed-up a limited resource is.' },

    { type: 'spot', prompt: 'A developer adds a label to a request counter. Tap the line that will cause a cardinality explosion.',
      code: { lang: 'js', src: `
        requests.inc({
          route: req.route,
          status: res.statusCode,
          user_id: req.user.id
        });` },
      lines: [4],
      explain: 'A `user_id` label creates a new time series for every user. Route and status are small, bounded sets. Per-user detail belongs in logs and traces, not metric labels.' },

    { type: 'estimate', q: 'A request counter has labels `route` (50 values) and `status` (6 values). Someone adds a `user_id` label with 200,000 users. Roughly how many time series are possible now?',
      answer: 60000000, unit: 'series', tolerance: 1.5, min: 1000, max: 10000000000,
      explain: '50 × 6 × 200,000 = 60 million. Series multiply across labels, so one unbounded label can overwhelm a metrics system.' },

    { type: 'mcq', q: 'A page calls 20 backend services in parallel. Each is slow (over 1 s) 1% of the time. Roughly how often is the page slow?',
      options: ['About 18% of the time', 'About 1% of the time', 'About 20% of the time, exactly', 'Never, since they run in parallel'],
      answer: 0,
      why: [null, 'That would be true for one call. Twenty chances multiply the odds.', 'Close, but it is not a simple sum: the exact figure is 1 − 0.99²⁰ ≈ 18.2%.', 'Parallel calls all have to finish, so the page waits for the slowest one.'],
      explain: 'The chance that all 20 are fast is 0.99²⁰ ≈ 82%, so about 18% of page loads hit a slow call. Tail latency is amplified by fan-out.' },

    { type: 'scenario', title: 'Green dashboard, angry customers', intro: 'Your dashboard shows average response time of 250 ms, well within your target. Yet customers complain that checkout "sometimes hangs".',
      meters: { 'customer trust': 55, 'time to answer': 65, 'metrics bill': 70 },
      steps: [
        { text: 'What do you change on the dashboard first?',
          choices: [
            { label: 'Show p95 and p99 latency alongside (or instead of) the average', score: 2, effects: { 'time to answer': 15, 'customer trust': 10 }, feedback: 'Immediately p99 shows 6 seconds. A small group is having a terrible time, hidden by the many fast requests.' },
            { label: 'Show the maximum latency only', score: 1, effects: { 'time to answer': 5 }, feedback: 'It reveals the worst case but a single outlier is noisy. Percentiles show how widespread the problem is.' },
            { label: 'Trust the average: customers are exaggerating', score: 0, effects: { 'customer trust': -20 }, feedback: 'The average is the measure most likely to hide what they feel.' }
          ] },
        { text: 'To find which customers suffer, a colleague proposes adding a `customer_id` label to the latency histogram. Your view?',
          choices: [
            { label: 'No: labels must stay bounded. Add region, plan or app version, and use traces for individual customers', score: 2, effects: { 'metrics bill': 10, 'time to answer': 10 }, feedback: 'Bounded labels slice the problem into groups; traces and logs show the one customer. The metrics system stays healthy.' },
            { label: 'Yes: more detail is always better', score: 0, effects: { 'metrics bill': -45, 'time to answer': -10 }, feedback: 'Hundreds of thousands of series later, queries time out and the bill arrives.' },
            { label: 'Yes, but only for 10 big customers', score: 1, effects: { 'metrics bill': -5 }, feedback: 'Bounded, so it will not explode, but it does not scale to the next customer who complains.' }
          ] },
        { text: 'You find that slow requests all use one overloaded database. Which USE-style number would have warned you earlier?',
          choices: [
            { label: 'Saturation: the database connection pool queue length', score: 2, effects: { 'time to answer': 10, 'customer trust': 10 }, feedback: 'Saturation (work waiting for a limited resource) rises before errors and long before total failure.' },
            { label: 'The server\'s uptime in days', score: 0, effects: {}, feedback: 'Uptime says it is running, not whether it is coping.' },
            { label: 'Total requests ever served', score: 0, effects: {}, feedback: 'A counter that only rises says nothing about trouble.' }
          ] }
      ],
      outro: 'Look at the **tail, not the average**; keep labels **bounded**; watch **saturation** as well as errors.' },

    { type: 'short', q: 'What is the name for the number of unique label combinations (time series) a metric has?', accept: ['cardinality'], hint: 'Starts with "card", ends with "-inality".',
      explain: '**Cardinality** is the number of distinct series. High cardinality, from labels like user IDs, is the classic way to wreck a metrics system.' }
  ],

  flashcards: [
    { q: 'Counter vs gauge vs histogram?', a: 'Counter only goes up (graph its rate). Gauge goes up and down (current level). Histogram counts values into buckets so you can get percentiles.' },
    { q: 'Why not just use averages?', a: 'Averages hide the slow tail. Many fast requests and a few very slow ones average to something no user experiences. Use p95 or p99.' },
    { q: 'What do RED and USE stand for?', a: 'RED for services: Rate, Errors, Duration. USE for resources: Utilisation, Saturation, Errors.' },
    { q: 'What is cardinality, and why does it matter?', a: 'The number of unique label combinations (time series). Unbounded labels like user ID multiply it into millions and break the metrics system.' },
    { q: 'What makes a good dashboard?', a: 'RED numbers per service with percentiles, one question per graph, deploy markers and links to logs or traces, not sixty graphs.' }
  ],

  glossary: [
    { term: 'Metric', def: 'A number measured over time, such as requests per second.', like: 'A reading on a gauge, recorded every few seconds.' },
    { term: 'Percentile', def: 'The value below which a given percentage of measurements fall; p95 means 95% were faster or smaller.', like: 'Finishing in the top 5% of a race.' },
    { term: 'Histogram', def: 'A metric type that counts observations in value ranges (buckets), enabling percentiles.' },
    { term: 'RED method', def: 'For services, watch Rate, Errors and Duration.' },
    { term: 'USE method', def: 'For resources, watch Utilisation, Saturation and Errors.' },
    { term: 'Cardinality', def: 'The number of unique combinations of label values for a metric, and so the number of time series stored.' }
  ],

  takeaways: [
    'Metrics are **cheap numbers over time**: counters rise, gauges move, histograms give you spread.',
    '**Percentiles, not averages**: p95 and p99 show what your unluckiest users feel.',
    'Start with **RED** for services and **USE** for resources.',
    'Keep labels **small and bounded**. IDs belong in logs and traces, never in metric labels.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-traces', {
  eli5: 'A trace is a timeline of one request’s whole journey through many services, so you can see at a glance which step made it slow.',

  cards: [
    { kind: 'story', title: 'Six services, four seconds, zero owners',
      body: `Checkout takes 4.2 seconds. The request passes through the gateway, orders, inventory, pricing, payments and a bank. Six teams each look at their own dashboard.

        Gateway team: "we are fast." Orders: "we are fast." Payments: "we are fast." All true, *for their own part*. Yet somewhere in the chain, 4 seconds are going missing, and nobody can see the whole picture.

        Metrics are per service and logs are per event. What you want is **one request, end to end**, with a stopwatch on every step. That is **distributed tracing**.` },

    { kind: 'metaphor', title: 'Parcel tracking',
      body: `Order a parcel and you get a **tracking number**. At every depot, a scan adds a line: "arrived at sorting centre, 09:12, left 09:40", "out for delivery, 11:05".

        Anyone can look up the number and see the **whole journey**, and spot where it sat for two days.

        A **trace** is the tracking history of one request. The **trace ID** is the tracking number. Each scan is a **span**: one step, with a start time and a duration, recorded by whichever service did the work.

        Where the metaphor stops: a parcel moves in a line. A request can fan out to many services at once, so a trace is a tree, not a list.` },

    { kind: 'concept', title: 'Traces and spans',
      body: `A **trace** is the full record of one request. It is made of **spans**.

        A **span** is one unit of work: "handle HTTP request", "query the database", "call the payment API". Each span records:

        - a **name** ("payments.charge")
        - a **start time** and a **duration**
        - a **parent span**, the step that triggered it (this makes the tree)
        - **attributes**: tags such as \`http.status_code=200\` or \`customer.tier=gold\`
        - a status (OK or error)

        All the spans in one trace share the same **trace ID**. The first span, with no parent, is the **root**.` },

    { kind: 'code', title: 'Reading a waterfall',
      body: 'Tracing tools draw a trace as a **waterfall**: time runs left to right, and each bar is a span. Here is checkout, drawn as text. **Tap the lines.**',
      code: { lang: 'text', src: `
        GET /checkout        |================================================| 1200 ms
          orders.create      | ====================================           | 900 ms
            inventory.check  |  ====                                          | 100 ms
            payments.charge  |       ============================             | 700 ms
              bank.api       |        ==========================              | 650 ms`,
        notes: {
          1: 'The **root span** covers the whole request: 1,200 ms from the user’s point of view.',
          2: 'A child of the root. The indentation shows who called whom.',
          3: 'Short and early. Not the problem.',
          4: 'Runs *after* inventory, not alongside it. Could the two be done in parallel? A trace makes that kind of question easy to spot.',
          5: 'There it is: 650 of the 1,200 ms are one call to an outside bank. **The slow hop.** The Payments team was right that their own code is fast; the time is in the wait.'
        } } },

    { kind: 'sequence', title: 'Context propagation: passing the baton',
      body: 'How do separate services know they belong to the same trace? The caller hands the trace context to the callee, in a header. This is **context propagation**.',
      actors: ['Gateway', 'Orders', 'Payments', 'Collector'],
      steps: [
        { at: 0, label: 'new trace: ID abc, span A', note: 'The first service to see the request creates a **trace ID** and a root span.' },
        { from: 0, to: 1, label: 'call + traceparent header', note: 'It adds the trace ID and its own span ID to the outgoing call as a header.' },
        { at: 1, label: 'span B (parent A)', note: 'Orders reads the header, so its span becomes a **child** of A, in the same trace.' },
        { from: 1, to: 2, label: 'call + traceparent header', note: 'Orders passes the context on, with its own span ID as the new parent.' },
        { at: 2, label: 'span C (parent B)', note: 'Payments does likewise.' },
        { from: 0, to: 3, label: 'report span A', dashed: true, note: 'Each service **reports its own spans**, usually in batches, to a collector. They are assembled later by trace ID.' },
        { from: 2, to: 3, label: 'report span C', dashed: true, note: 'The collector joins A, B and C into one waterfall using the IDs.' }
      ] },

    { kind: 'code', title: 'The header that carries it',
      body: 'There is a standard for this, called **W3C Trace Context**. The header is named `traceparent`.',
      code: { lang: 'http', src: `
        POST /orders HTTP/1.1
        traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`,
        notes: {
          2: 'Four parts, separated by dashes: a **version** (`00`), the **trace ID** (the long one, shared by the whole journey), the **parent span ID** (the caller’s span), and **flags** (`01` means "this trace is being recorded"). Because it is a standard, services built with different languages and tools can still join one trace.'
        } } },

    { kind: 'pitfall', title: 'Broken chains',
      body: `A trace is only as complete as its weakest link. Context gets lost when:

        - **one service is not instrumented**, or an old library does not forward the header
        - **work goes through a queue**: the message must carry the trace context too, or the trace ends at the queue
        - **async code or thread pools** switch context and the "current trace" is forgotten
        - **a gateway or proxy strips unknown headers**

        The symptom: traces that stop halfway, or the same request showing up as several unrelated traces. Fix it by making propagation **the default** in your shared libraries and checking for orphaned spans.` },

    { kind: 'compare', title: 'Sampling: you cannot keep every trace',
      body: 'At thousands of requests a second, storing every trace is costly. So you **sample**: keep some, drop the rest.',
      cols: ['Head sampling', 'Tail sampling'],
      rows: [
        ['When it decides', 'At the start of the request, before anything happens', 'After the trace finishes, once the outcome is known'],
        ['How', 'Random: keep 1 in 100', 'Keep all errors and slow traces, plus a few normal ones'],
        ['Pros', 'Simple, cheap, no buffering', 'Keeps the interesting traces: the ones you will want'],
        ['Cons', 'May throw away the one failing request you needed', 'Needs somewhere to hold whole traces until they finish: more work']
      ],
      note: 'Many teams combine both. The key point: the decision is made once per trace, so every service keeps or drops it together.' },

    { kind: 'tip', title: 'Using traces well',
      body: `- Look for the **longest bar**, then for **gaps** (time spent waiting, not working) and **serial calls that could run in parallel**.
        - Look for **the same call repeated many times**: that is the N+1 query pattern, seen from above.
        - Add useful **attributes** (customer tier, app version, region) but never secrets or personal data.
        - Put the **trace ID in your logs**, so you can jump from a trace to the logs for any span.`,
      note: 'In the lab that follows, you will read a real-looking trace waterfall and find the slow span yourself.' }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each tracing word to its meaning.',
      pairs: [['Trace', 'The whole journey of one request'], ['Span', 'One timed step within that journey'], ['Trace ID', 'The shared number tying all the spans together'], ['Root span', 'The first span, with no parent'], ['Attribute', 'A tag on a span such as the HTTP status']],
      explain: 'A trace is a tree of spans that share one trace ID. The root span is the top; every other span has a parent.' },

    { type: 'order', after: 4, prompt: 'Put context propagation in order.',
      items: ['The first service creates a trace ID and a root span', 'It sends the trace ID and its span ID in a header with the outgoing call', 'The next service reads the header and starts a child span', 'Each service reports its spans to a collector', 'The collector joins the spans by trace ID into one waterfall'],
      explain: 'The context travels with the request, and the spans are stitched together afterwards by the shared trace ID.' },

    { type: 'mcq', q: 'In a waterfall, one 650 ms bar sits inside a 700 ms parent span, which is inside a 1,200 ms root. What does that suggest?',
      options: ['Most of the request time is spent in that one nested call', 'The root span is broken', 'The parent service is slow in its own code', 'The request ran in parallel with other work'],
      answer: 0,
      why: [null, 'Nested spans fit inside their parents. That is how a healthy trace looks.', 'The parent is 700 ms and 650 ms is spent in the child, so only about 50 ms is the parent’s own work.', 'The parent contains the child. Nothing says it ran in parallel with others.'],
      explain: 'A child that fills most of its parent’s time points at the slow hop. The parent is mostly just waiting for it.' },

    { type: 'spot', prompt: 'This service calls another service, but traces will break here. Tap the line that is the problem.',
      code: { lang: 'js', src: `
        app.post('/orders', async (req, res) => {
          const price = await fetch(PRICING_URL, {
            headers: { 'content-type': 'application/json' },
            method: 'POST', body: JSON.stringify(req.body)
          });
          res.json(await price.json());
        });` },
      lines: [3],
      explain: 'The outgoing request carries no `traceparent` header, so the pricing service starts a brand-new, unrelated trace. Forward the trace context (instrumentation libraries do this automatically).' },

    { type: 'tf', statement: 'Every span in one distributed trace carries the same trace ID, passed from service to service.', answer: true,
      explain: 'There is one trace ID for the whole request, created at the start and passed to every service in a header. That shared ID is what lets the tools stitch the spans together; timestamps would be far too unreliable.' },

    { type: 'bucket', prompt: 'What does this waterfall pattern most likely mean?',
      buckets: ['Slow dependency', 'Missed parallelism', 'Repeated calls (N+1)'],
      items: [['One long bar for an external API, short bars elsewhere', 0], ['Two independent calls running one after the other', 1], ['Fifty tiny identical database spans in a row', 2], ['A database span taking 3 s while the parent is idle', 0], ['Call B starts only when call A ends, but B does not need A’s result', 1], ['The same `SELECT` repeated once per item in a list', 2]],
      explain: 'Waterfalls show shapes. One huge bar is a slow hop, stacked sequential bars show missed parallelism, and a comb of tiny repeated bars is the N+1 pattern you met with databases.' },

    { type: 'estimate', q: 'A service handles 10,000 requests per second. You use head sampling and keep 1% of traces. Roughly how many traces per second are stored?',
      answer: 100, unit: 'traces per second', tolerance: 1.2, min: 1, max: 100000,
      explain: '10,000 × 1% = 100 traces per second. That is enough to see typical behaviour, though head sampling may miss rare failures: tail sampling keeps all errors.' },

    { type: 'scenario', title: 'Where did the four seconds go?', intro: 'Checkout is slow for some customers. You open a trace for a slow request. The root span is 4.2 s, with children for inventory, pricing, payments and shipping-quote.',
      meters: { 'customer trust': 55, 'time to answer': 70, cost: 65 },
      steps: [
        { text: 'The waterfall shows that shipping-quote takes 3.6 s, and payments only 200 ms. Who should look first?',
          choices: [
            { label: 'The team that owns shipping-quote, starting with that span’s own children and attributes', score: 2, effects: { 'time to answer': 20, 'customer trust': 10 }, feedback: 'The trace has pointed at the exact hop. Open its child spans: it makes 40 identical calls to a carrier API one by one.' },
            { label: 'The payments team, because payments is the most important service', score: 0, effects: { 'time to answer': -20 }, feedback: 'Importance is not the same as slowness. The trace says payments is fast here.' },
            { label: 'Everyone, in a big meeting', score: 1, effects: { 'time to answer': -10, cost: -10 }, feedback: 'The trace removes the need for a meeting. Go straight to the slow span.' }
          ] },
        { text: 'You see 40 calls in a row to the carrier API, each about 90 ms. What is the smartest fix?',
          choices: [
            { label: 'Batch them into one call, or run them in parallel', score: 2, effects: { 'time to answer': 15, 'customer trust': 15 }, feedback: 'Forty sequential calls cost 3.6 s. One batched call, or parallel calls, costs a fraction.' },
            { label: 'Raise the timeout on the carrier calls', score: 0, effects: { 'customer trust': -10 }, feedback: 'The calls are not timing out. They are simply many and sequential.' },
            { label: 'Cache the carrier’s answer forever', score: 1, effects: { 'customer trust': -5 }, feedback: 'Shipping quotes change. Some caching might help, but you would still not fix the shape of the problem.' }
          ] },
        { text: 'Tracing every request costs money. How do you keep the useful traces without storing all of them?',
          choices: [
            { label: 'Tail-sample: keep all slow and failed traces, and a small share of normal ones', score: 2, effects: { cost: 15, 'time to answer': 10 }, feedback: 'You keep exactly the traces you needed today and drop the dull ones.' },
            { label: 'Turn tracing off to save money', score: 0, effects: { cost: 10, 'time to answer': -30 }, feedback: 'You would be back to guessing next time.' },
            { label: 'Keep 1% at random and hope', score: 1, effects: { cost: 10, 'time to answer': -5 }, feedback: 'Cheap, but the specific slow request you need may not be in the 1%.' }
          ] }
      ],
      outro: 'Traces show **where** time goes, in one picture. Then metrics and logs explain **how bad** and **why**.' },

    { type: 'short', q: 'What is the name for one timed step within a trace, such as "query the database"?', accept: ['span', 'spans', 'a span'], hint: 'It is also a word for how far something stretches.',
      explain: 'A **span** is one unit of work in a trace, with a name, start time, duration and a parent span.' }
  ],

  flashcards: [
    { q: 'What is a trace and what is a span?', a: 'A trace is the full journey of one request across services. A span is one timed step in it, with a name, start, duration and parent span.' },
    { q: 'What is context propagation?', a: 'Passing the trace ID and parent span ID from service to service (in a header like traceparent) so every span lands in the same trace.' },
    { q: 'What does a waterfall help you find?', a: 'The slow hop (longest bar), idle gaps, serial calls that could run in parallel, and repeated calls such as N+1 patterns.' },
    { q: 'Head vs tail sampling?', a: 'Head sampling decides at the start (cheap, random, may miss failures). Tail sampling decides after the trace ends (keeps errors and slow traces, needs more infrastructure).' },
    { q: 'Why do traces sometimes stop halfway?', a: 'Context was lost: an uninstrumented service, a queue or async hop that did not carry the headers, or a proxy that stripped them.' }
  ],

  glossary: [
    { term: 'Distributed tracing', def: 'Recording the path and timing of a single request as it moves through many services.', like: 'Parcel tracking for requests.' },
    { term: 'Trace', def: 'The complete record of one request’s journey, made of spans that share one trace ID.' },
    { term: 'Span', def: 'One timed unit of work within a trace, with a name, duration, parent and attributes.', like: 'One scan at one depot.' },
    { term: 'Context propagation', def: 'Passing trace identifiers from one service to the next, usually in request headers.', like: 'Handing over the baton in a relay race.' },
    { term: 'Sampling', def: 'Keeping only a share of traces to control cost, chosen at the start (head) or end (tail) of a request.' }
  ],

  takeaways: [
    'A **trace** is one request’s whole journey; a **span** is one timed step in it.',
    'Services join a trace by **propagating context** (the `traceparent` header). Queues and async hops need care.',
    'Read the waterfall for the **longest bar**, idle gaps, missed parallelism and repeated calls.',
    '**Sample** to control cost: tail sampling keeps the errors and slow requests you actually want.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-instrumentation', {
  eli5: 'Instrumenting code means adding little sensors so it reports what it is doing: some come free from libraries, some you add by hand, and a standard called OpenTelemetry lets you send it all anywhere.',

  cards: [
    { kind: 'concept', title: 'Code is silent unless you make it talk',
      body: `Your program does thousands of things a second, and says nothing about any of them. The logs, metrics and traces from the last three lessons do not appear by magic. Something has to **emit** them.

        **Instrumentation** means adding code (or hooks) that records what the program is doing: start and end of a request, a query run, an error thrown, an order placed.

        The stream of data that comes out is **telemetry**, a word from "tele" (far) and "metry" (measure): measurements sent from a distance, like readings from a weather balloon.

        The design question is: **what do we record, who writes the code, and where does the data go?** The cards that follow answer each in turn.` },

    { kind: 'metaphor', title: 'Factory gauges and the ones you add',
      body: `A new car comes with factory-fitted gauges: speed, fuel, temperature. You did nothing and they work. That is **automatic instrumentation**.

        Now suppose you run a delivery business and want to know "parcels delivered per hour per driver". The car cannot know that. You add your own counter and a clipboard. That is **manual instrumentation**.

        Good observability uses both. Automatic gives broad cover for free (every web request, every database call). Manual adds the things only *you* understand: the business events, the important decisions.` },

    { kind: 'compare', title: 'Automatic vs manual instrumentation',
      cols: ['Automatic', 'Manual'],
      rows: [
        ['How', 'An agent or library wraps frameworks, HTTP clients and database drivers for you', 'You write code that creates spans, counts events and adds attributes'],
        ['Effort', 'Often a few lines of set-up, no code changes', 'Every place you want data needs a line of code'],
        ['Covers', 'The edges: incoming requests, outgoing calls, queries', 'Your own logic: "apply discount", "orders placed", "cache hit"'],
        ['Weakness', 'Does not understand your business', 'Easy to forget; adds code to maintain']
      ],
      note: 'A sensible order: turn on automatic instrumentation first for instant cover, then add manual spans and metrics where the picture has holes.' },

    { kind: 'code', title: 'A manual span with OpenTelemetry',
      body: 'This wraps one piece of business logic in its own span. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        const { trace, SpanStatusCode } = require('@opentelemetry/api');
        const tracer = trace.getTracer('checkout');

        async function applyDiscount(order) {
          return tracer.startActiveSpan('apply-discount', async (span) => {
            try {
              span.setAttribute('order.items', order.items.length);
              return await compute(order);
            } catch (err) {
              span.recordException(err);
              span.setStatus({ code: SpanStatusCode.ERROR });
              throw err;
            } finally {
              span.end();
            }
          });
        }`,
        notes: {
          2: 'A **tracer** is named after your component, so spans can be grouped by who produced them.',
          5: '`startActiveSpan` creates a span and makes it the current one, so anything called inside becomes its child automatically.',
          7: 'An **attribute**: a useful fact about this step. A count is fine; a customer’s email is not.',
          10: 'On failure, record the error on the span and mark it as an error, so it stands out in the trace.',
          14: '**Always end the span**, even when something throws. A span that never ends is a leak, and shows up broken or missing.'
        } } },

    { kind: 'diagram', title: 'A telemetry pipeline',
      body: 'Where does the data go? Rarely straight from the app to a vendor. A middle stage gives you control.',
      nodes: [
        { id: 'app', label: 'Your app + SDK', icon: '🖥️', x: 1, y: 0 },
        { id: 'col', label: 'Collector', icon: '🚦', x: 1, y: 1, tone: 'accent' },
        { id: 'tr', label: 'Trace store', icon: '🧵', x: 0, y: 2, tone: 'info' },
        { id: 'me', label: 'Metrics store', icon: '📈', x: 1, y: 2, tone: 'good' },
        { id: 'lo', label: 'Log store', icon: '📜', x: 2, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'app', to: 'col', label: 'OTLP' },
        { from: 'col', to: 'tr' }, { from: 'col', to: 'me' }, { from: 'col', to: 'lo' }
      ],
      caption: 'The **SDK** inside your app collects spans, metrics and logs. A **collector** receives them, then batches, filters, redacts, samples and routes them to whichever backends you use.' },

    { kind: 'steps', title: 'The life of a span',
      body: 'Follow one piece of telemetry from your code to a screen.',
      steps: [
        { title: 'Created', body: 'Your code (or an automatic library) starts a span and later ends it. The SDK notes the times and attributes.' },
        { title: 'Buffered and batched', body: 'The SDK does **not** send each span instantly. It collects them in memory and sends them in batches, so your request is not slowed down.' },
        { title: 'Exported', body: 'The batch leaves over the network in a standard format called **OTLP** (the OpenTelemetry protocol).' },
        { title: 'Processed', body: 'The collector can drop noise, strip secrets, add tags (cluster, region), sample, and fan out to several destinations.' },
        { title: 'Stored and queried', body: 'A backend such as Jaeger, Tempo or a commercial service stores it. You open the waterfall and search.' }
      ] },

    { kind: 'concept', title: 'OpenTelemetry: one standard instead of many',
      body: `In the past, each monitoring product had its own instrumentation. Switching vendor meant re-instrumenting every service: a miserable job.

        **OpenTelemetry** (often "OTel") is an open standard, run by the Cloud Native Computing Foundation, that fixes this. It was formed by merging two earlier projects, OpenTracing and OpenCensus.

        It gives you:

        - **APIs and SDKs** for most popular languages, covering traces, metrics and logs
        - **Automatic instrumentation** for common frameworks
        - **OTLP**, a common wire format
        - the **Collector**, a vendor-neutral pipeline component
        - **semantic conventions**: agreed attribute names such as \`http.request.method\`

        Instrument **once**, send **anywhere**. The backend you pick becomes a changeable decision.` },

    { kind: 'pitfall', title: 'The overhead budget',
      body: `Instrumentation is not free. Every span uses CPU and memory, every export uses network, and every stored byte costs money. Instrument too much and you slow the thing you are trying to watch, and pay a fortune.

        So set an **overhead budget**: decide how much slowdown and spend you will accept, then **measure** it, rather than hoping.

        Ways to stay inside it:

        - **sample** traces; do not keep them all
        - export in **batches**, asynchronously, never blocking a request
        - do **not** create a span per iteration of a huge loop. One span with a count attribute is enough
        - keep metric labels bounded, and log levels sensible
        - drop or shrink noisy attributes in the collector` },

    { kind: 'tip', title: 'Where to start',
      body: `1. Turn on **automatic instrumentation** for your web framework, HTTP client and database driver.
        2. Make sure **trace context is propagated** everywhere, including queues.
        3. Add **RED metrics** per service.
        4. Add **manual spans and metrics** around business-critical steps only: checkout, signup, payment.
        5. Put the **trace ID in every log line**.
        6. Agree **naming and attribute conventions** across teams, so "customer" is not "cust_id" in one place and "userId" in another.`,
      note: 'Instrument for the questions you will have at 3am, not for the dashboards you will build next week.' }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each item to how its data gets recorded.',
      pairs: [['Framework wrapper agent', 'Records every request, no code changes'], ['An "orders placed" counter', 'You add it by hand for a business event'], ['Database driver hooks', 'Creates a span for each query by itself'], ['A "calculate shipping" span', 'You wrap your own function by hand']],
      explain: 'Automatic instrumentation hooks into common libraries without code changes. Manual instrumentation records your own logic and business events.' },

    { type: 'bucket', prompt: 'Automatic or manual instrumentation?',
      buckets: ['Automatic is enough', 'Needs manual instrumentation'],
      items: [['Duration of every incoming HTTP request', 0], ['Number of coupons redeemed per hour', 1], ['Time of each SQL query', 0], ['Which pricing rule was applied to an order', 1], ['Outgoing calls made with a common HTTP client', 0], ['Whether a recommendation came from cache or live', 1]],
      explain: 'Framework-level events (requests, queries, outgoing calls) are covered automatically. Anything about your own business logic needs a line of code from you.' },

    { type: 'order', after: 5, prompt: 'Put the life of a span in order.',
      items: ['Your code starts and ends a span', 'The SDK buffers spans and groups them into a batch', 'The batch is exported in OTLP over the network', 'The collector filters, redacts, samples and routes it', 'A backend stores it and you view it as a waterfall'],
      explain: 'Batching and a collector keep telemetry off the request path and give you one place to control what gets stored.' },

    { type: 'mcq', q: 'What is the main benefit of OpenTelemetry?',
      options: ['Instrument once, then pick or switch the backend freely', 'It stores and displays all your telemetry itself', 'It makes your code run faster', 'It replaces the need for logs, metrics and traces'],
      answer: 0,
      why: [null, 'OpenTelemetry produces and moves telemetry. Storing and displaying it is the job of a backend such as Jaeger, Tempo or a commercial tool.', 'It adds a little overhead. It does not speed anything up.', 'It is the standard way of producing the three signals, not a replacement for them.'],
      explain: 'OTel decouples how you produce telemetry from where it goes, so switching vendors does not mean re-instrumenting everything.' },

    { type: 'spot', prompt: 'If `gateway.pay` throws an error, this span never ends. Tap the line that should be protected by a `finally` block.',
      code: { lang: 'js', src: `
        async function charge(card) {
          const span = tracer.startSpan('charge');
          const result = await gateway.pay(card);
          span.end();
          return result;
        }` },
      lines: [4],
      explain: 'Line 4 is skipped when line 3 throws, leaving the span open and the trace broken. Put `span.end()` in a `finally` block so it runs whatever happens.' },

    { type: 'ab', q: 'A function processes 10,000 items in a loop. Which instrumentation respects the overhead budget?',
      a: { lang: 'js', label: 'Span per item', src: `
        for (const item of items) {
          const span = tracer.startSpan('process-item');
          handle(item);
          span.end();
        }` },
      b: { lang: 'js', label: 'One span, counted', src: `
        const span = tracer.startSpan('process-items');
        span.setAttribute('items.count', items.length);
        for (const item of items) handle(item);
        span.end();` },
      answer: 'b',
      explain: 'Ten thousand spans per call would cost CPU, memory, network and storage, and bury the trace. One span with a count gives the useful information at a tiny cost.' },

    { type: 'estimate', q: 'A service handles 5,000 requests per second and each request makes about 12 spans. You sample 10% of traces. Roughly how many spans per second are exported?',
      answer: 6000, unit: 'spans per second', tolerance: 1.2, min: 10, max: 10000000,
      explain: '5,000 × 12 = 60,000 spans per second if you kept everything. Sampling 10% leaves 6,000. This arithmetic is how you plan the overhead budget.' },

    { type: 'scenario', title: 'Adopting tracing at a growing company', intro: 'Your company has twenty services in four languages, and three different monitoring products chosen by different teams. Debugging cross-service problems is painful. You are asked to fix observability.',
      meters: { 'debug speed': 40, cost: 70, 'team goodwill': 60 },
      steps: [
        { text: 'How do you approach instrumentation across all twenty services?',
          choices: [
            { label: 'Adopt OpenTelemetry as the standard, starting with automatic instrumentation', score: 2, effects: { 'debug speed': 25, 'team goodwill': 10 }, feedback: 'One standard across languages, broad cover with little effort, and the backend becomes a swappable decision.' },
            { label: 'Let each team pick whatever they like', score: 0, effects: { 'debug speed': -10, 'team goodwill': 5 }, feedback: 'Traces cannot cross the boundary between different tools, so the cross-service problem remains.' },
            { label: 'Write a custom in-house tracing library', score: 1, effects: { 'debug speed': 5, cost: -35, 'team goodwill': -15 }, feedback: 'You would be reinventing something a large community already maintains, and you would own it forever.' }
          ] },
        { text: 'Traces stop at the message queue between orders and fulfilment. What is the likely cause and fix?',
          choices: [
            { label: 'Context is not carried in the message. Add the trace context to message headers and read it on the consumer', score: 2, effects: { 'debug speed': 20 }, feedback: 'HTTP headers do the carrying for calls, but queues need the same context inside the message itself.' },
            { label: 'The queue is too slow. Replace it', score: 0, effects: { cost: -25 }, feedback: 'Speed has nothing to do with broken trace context.' },
            { label: 'Accept that traces end at queues', score: 1, effects: { 'debug speed': -5 }, feedback: 'Common, but you lose visibility exactly where asynchronous bugs hide.' }
          ] },
        { text: 'The first month\'s bill is large and a service has slowed slightly. What do you do?',
          choices: [
            { label: 'Set an overhead budget: sample traces, batch exports, drop noisy spans and attributes in the collector', score: 2, effects: { cost: 25, 'debug speed': 5 }, feedback: 'You keep the value and cut the waste, with numbers to check against.' },
            { label: 'Turn off all instrumentation', score: 0, effects: { cost: 10, 'debug speed': -30 }, feedback: 'You are blind again, and the next incident will be longer.' },
            { label: 'Ignore it; observability is worth any price', score: 0, effects: { cost: -20, 'team goodwill': -10 }, feedback: 'The budget exists so the cost stays proportionate and does not hurt the thing being watched.' }
          ] }
      ],
      outro: 'Instrument **broadly (automatic), deliberately (manual) and within a budget**.' },

    { type: 'short', q: 'What is the open standard for producing logs, metrics and traces, often abbreviated "OTel"?', accept: ['OpenTelemetry', 'open telemetry', 'otel'], hint: 'Open + a word for readings sent from far away.',
      explain: '**OpenTelemetry** is the vendor-neutral standard: APIs, SDKs, a wire format (OTLP) and a collector for telemetry.' }
  ],

  flashcards: [
    { q: 'What is instrumentation, and what is telemetry?', a: 'Instrumentation is the code or hooks that record what a program does. Telemetry is the resulting data (logs, metrics, traces) sent out for analysis.' },
    { q: 'Automatic vs manual instrumentation?', a: 'Automatic wraps frameworks, HTTP clients and DB drivers with no code changes. Manual is code you add for your own logic and business events. Use both.' },
    { q: 'What does the OpenTelemetry Collector do?', a: 'It receives telemetry from apps, then batches, filters, redacts, samples and routes it to one or more backends.' },
    { q: 'Why is OpenTelemetry valuable?', a: 'It is a vendor-neutral standard (APIs, SDKs, OTLP, collector, naming conventions), so you instrument once and can change backends freely.' },
    { q: 'What is an overhead budget?', a: 'A deliberate limit on CPU, network and cost that telemetry may consume, kept in check by sampling, batching and avoiding noisy spans.' }
  ],

  glossary: [
    { term: 'Instrumentation', def: 'Code or hooks added to a program so it records data about what it is doing.', like: 'Fitting gauges to an engine.' },
    { term: 'Telemetry', def: 'Data emitted by a running system about itself: logs, metrics and traces.' },
    { term: 'OpenTelemetry', def: 'An open, vendor-neutral standard and set of tools for producing and moving telemetry.', aka: ['OTel'] },
    { term: 'OTLP', def: 'The OpenTelemetry Protocol: the standard format for sending telemetry between SDKs, collectors and backends.' },
    { term: 'Collector', def: 'A pipeline component that receives telemetry, processes it and forwards it to storage backends.', like: 'A sorting office between your app and the archives.' }
  ],

  takeaways: [
    'Code only reports what it has been **instrumented** to report. Plan it, do not bolt it on.',
    'Start **automatic** for broad cover; add **manual** spans and metrics for business logic.',
    '**OpenTelemetry** is the standard: instrument once, choose or change the backend later.',
    'Keep an **overhead budget**: sample, batch, avoid span-per-loop-iteration, and measure.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ob-slo-alerting', {
  eli5: 'Decide how reliable your service needs to be, measure it, wake a human only when real users are being hurt, and learn from every outage without blaming anyone.',

  cards: [
    { kind: 'story', title: 'The 3am page that did not matter',
      body: `Your phone screams at 3am. The alert: **"CPU above 85% on server 14."** You stumble to the laptop. Customers are fine. The server was just busy doing a nightly job. You go back to bed, annoyed, and sleep badly.

        A week later, a different night, checkout is failing for 20% of customers for an hour. No alert fires, because the CPU was normal. A customer tweeting about it is how you find out.

        Both failures have the same root: **alerts about machines instead of about users**. The fix starts with a question you may never have answered: *how good is good enough?*` },

    { kind: 'compare', title: 'SLI, SLO, SLA',
      body: 'Three acronyms that sound alike and mean different things.',
      cols: ['What it is', 'Example'],
      rows: [
        ['SLI: service level indicator', 'A **measurement** of how well the service is doing, usually a ratio of good events to all events', '"Share of requests that succeed and take under 300 ms"'],
        ['SLO: service level objective', 'An internal **target** for an SLI over a time window', '"99.9% of requests are good, over 30 days"'],
        ['SLA: service level agreement', 'A **contract** with customers, with consequences (refunds, credits) if broken', '"Below 99.5% in a month and you get service credit"']
      ],
      note: 'The SLO is normally stricter than the SLA, so you notice and fix things long before you owe anyone money.' },

    { kind: 'metaphor', title: 'The error budget: a monthly allowance',
      body: `If your SLO is 99.9%, you are saying "0.1% of the time it is **allowed** to be bad". That allowance is your **error budget**.

        Over 30 days that is 0.1% of 43,200 minutes ≈ **43 minutes** of bad service. Think of it like a monthly spending allowance: spend it wisely, and when it is gone, stop spending.

        Why not aim for 100%? It is impossibly expensive, your users' own phones and Wi-Fi are less reliable than that, and it would mean never shipping anything risky.

        So the budget is a deal between speed and safety:

        - **plenty left**: ship features, run experiments, take risks
        - **nearly gone**: slow down, fix reliability, freeze risky releases

        It turns an argument into a number.` },

    { kind: 'compare', title: 'Alert on symptoms, not causes',
      body: 'A **symptom** is what users feel. A **cause** is something inside that *might* produce a symptom. Page people for symptoms.',
      cols: ['Cause alert (avoid paging on these)', 'Symptom alert (page on these)'],
      rows: [
        ['Example', 'CPU above 85% on server 14', 'Checkout errors above 2% for 5 minutes'],
        ['Fires when', 'A machine looks busy, whether or not anyone is hurt', 'Users are actually failing or waiting'],
        ['Problem', 'Noisy; misses failures with other causes', 'You then use dashboards and traces to find the cause'],
        ['Action', '"…so what do I do?"', 'Clear: users are hurting now, investigate']
      ],
      note: 'Cause-based signals are still useful, as dashboard graphs and low-urgency tickets ("disk 80% full, fix this week"). They just should not wake anyone up.' },

    { kind: 'concept', title: 'What makes a good page',
      body: `Every alert that wakes a human should be:

        - **Urgent**: needs action now, not tomorrow
        - **Actionable**: there is something a person can do
        - **Real**: a user-visible problem, not a false alarm

        Alerts that fail these tests train people to ignore the pager. This is **alert fatigue**, and it is dangerous: the one real alert drowns among fifty noisy ones.

        A modern approach is **burn-rate alerting**. Instead of "error rate above X", ask "at this speed, will we use up the whole month's error budget soon?". A **fast burn** (the budget draining in hours) pages someone. A **slow burn** (draining over days) just opens a ticket.` },

    { kind: 'code', title: 'A runbook: the cheat sheet for a tired brain',
      body: `A **runbook** is a short, written guide attached to an alert: what it means, how to check, how to fix. At 3am, nobody remembers anything. **Tap the highlighted lines.**`,
      code: { lang: 'text', src: `
        ALERT: Checkout error rate above 2% for 5 min
        Impact: customers cannot pay.
        1. Check the deploy marker. Release in the last hour?
           Yes -> roll back (see "Rollback" page).
        2. Split errors by payment provider on the dashboard.
           One provider only -> flip the kill switch to backup.
        3. Open a trace of a failing request; find the slow span.
        4. Still stuck after 15 min -> page the payments lead.
        Owner: Payments team.   Last tested: March.`,
        notes: {
          2: 'Say who is affected and how badly, so the responder can judge urgency.',
          3: 'The first step is the commonest cause: a recent change. **Mitigate first**: rolling back is faster than understanding.',
          5: 'Uses the tools from earlier lessons: a dashboard split, a kill switch from the resilience module.',
          8: 'An escalation rule: nobody should suffer alone, or for too long.',
          9: 'A named owner and a review date. Stale runbooks are worse than none.'
        } } },

    { kind: 'steps', title: 'Being on call, and handling an incident',
      body: 'On-call means one person (a rotation, shared fairly) is reachable to respond when a page fires. An incident usually follows these steps.',
      steps: [
        { title: 'Detect and acknowledge', body: 'The page fires. The responder says "I have it", so nobody else duplicates the work.' },
        { title: 'Assess impact', body: 'Who is affected, how badly? Decide how serious it is and whether to call for help or name someone to lead.' },
        { title: 'Mitigate first', body: 'Stop the pain: roll back, flip a flag, fail over, shed load. Understanding the cause can wait until users are safe.' },
        { title: 'Communicate', body: 'Update the status page and the people waiting. Silence makes everything feel worse.' },
        { title: 'Resolve and hand over', body: 'Confirm the metrics recover. If the shift ends, hand over clearly. A tired hero is a risk.' },
        { title: 'Learn', body: 'Within days, hold a postmortem (next card).' }
      ] },

    { kind: 'concept', title: 'Blameless postmortems',
      body: `After a serious incident, the team writes a **postmortem**: a document of what happened, why, and what will change.

        **Blameless** means the question is never "who messed up?" but "**how did our system make this mistake easy?**". Someone ran the wrong command; why was that command possible, and why did nothing warn them?

        Why not blame? Because if people fear punishment they hide mistakes, and you lose the very information you need. Safety-critical fields like aviation learned this long ago.

        A good postmortem has: a **timeline**, the **impact**, **contributing factors** (usually several), what went **well**, and **action items** with owners and dates. Without actions, it is just a story.` },

    { kind: 'realworld', title: 'Where this comes from',
      body: `SLOs and error budgets were made famous by Google's Site Reliability Engineering (SRE) practice, described in the free book *Site Reliability Engineering*. The ideas now run through the industry: cloud providers publish SLAs, product teams set SLOs, and on-call rotations use runbooks and blameless reviews.

        You now have the whole loop: **instrument** (last lesson) → **measure** with SLIs → **target** with SLOs → **alert** on symptoms and budget burn → **respond** with runbooks → **learn** with postmortems → improve the system, and repeat.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each acronym to what it is.',
      pairs: [['SLI', 'A measurement, such as the share of good requests'], ['SLO', 'An internal target for that measurement'], ['SLA', 'A contract with consequences if broken'], ['Error budget', 'The amount of badness the SLO allows']],
      explain: 'Measure it (SLI), aim for it (SLO), promise it (SLA). The budget is whatever the SLO leaves over from 100%.' },

    { type: 'estimate', after: 2, q: 'Your SLO is 99.9% of requests good over 30 days. About how many minutes of full downtime does that error budget allow?',
      answer: 43, unit: 'minutes', tolerance: 1.2, min: 1, max: 100000,
      explain: 'A 30-day month is 43,200 minutes. 0.1% of that is about 43 minutes. A 99.99% SLO would leave only about 4 minutes.' },

    { type: 'bucket', after: 3, prompt: 'Should this page a human at 3am?',
      buckets: ['Page a human', 'Dashboard or ticket only'],
      items: [['Checkout error rate above 2% for 5 minutes', 0], ['CPU at 85% on one server', 1], ['Disk 80% full, filling slowly', 1], ['Page load time p99 well above target for 10 minutes', 0], ['One pod restarted once', 1], ['Error budget will be gone within two hours at the current rate', 0]],
      explain: 'Page on user-visible symptoms and fast budget burn. Internal causes and slow-moving issues are for dashboards and tickets, handled in working hours.' },

    { type: 'mcq', q: 'Your service has used 95% of this month’s error budget with ten days left. What does the error-budget idea suggest?',
      options: ['Slow risky releases and fix reliability until it recovers', 'Release faster to make up for lost time', 'Quietly change the SLO to something easier to meet', 'Hide the numbers from the product team'],
      answer: 0,
      why: [null, 'More risky changes would burn the last 5% and break the SLO.', 'Moving the target to dodge the problem defeats its purpose. SLOs are changed deliberately, not to hide a miss.', 'The budget is meant to be a shared, visible number so the trade-off is agreed openly.'],
      explain: 'The budget is the agreed room for risk. When it is nearly spent, reliability work takes priority over new features.' },

    { type: 'tf', statement: 'A good SLO for an important service is 100%, because any failure is unacceptable.', answer: false,
      explain: '100% is unreachable, since networks, devices and dependencies all fail, and chasing it would stop all change. A realistic target leaves an error budget to spend on progress.' },

    { type: 'order', prompt: 'Put the incident response steps in order.',
      items: ['The page fires and the responder acknowledges it', 'Assess who is affected and how badly', 'Mitigate: roll back, flip a flag or fail over', 'Communicate status to users and colleagues', 'Hold a blameless postmortem and assign actions'],
      explain: 'Mitigate before you investigate, keep people informed, and learn once the fire is out.' },

    { type: 'ab', q: 'Which alert is better for waking someone at night?',
      a: { lang: 'text', label: 'Cause', src: `
        Alert: CPU > 85% on web-14
        Action: ???` },
      b: { lang: 'text', label: 'Symptom', src: `
        Alert: checkout errors > 2% for 5 min
        Runbook: link, impact: customers cannot pay` },
      answer: 'b',
      explain: 'The symptom alert means real users are hurt now and comes with a runbook. The CPU alert may fire with no harm, or stay silent while something else breaks.' },

    { type: 'scenario', title: 'The noisy pager', intro: 'Your team of five takes turns on call. Last week the pager fired 63 times, mostly for CPU and disk warnings. People are exhausted, and last Tuesday a real checkout outage was ignored for 20 minutes because "it is probably noise".',
      meters: { 'customer trust': 55, 'team health': 35, 'budget left': 60 },
      steps: [
        { text: 'What is the first change you make to the alerting?',
          choices: [
            { label: 'Page only on user-visible symptoms (error rate, latency); move cause alerts to dashboards and tickets', score: 2, effects: { 'team health': 25, 'customer trust': 10 }, feedback: 'Every page now means a real problem. People trust the pager again, and real outages are not ignored.' },
            { label: 'Raise every threshold a bit, so fewer fire', score: 1, effects: { 'team health': 10 }, feedback: 'It reduces noise but keeps the wrong kind of alert, and may hide real trouble too.' },
            { label: 'Mute alerts outside office hours', score: 0, effects: { 'customer trust': -20, 'team health': 5 }, feedback: 'Customers do not fail only in office hours. You have swapped noise for silence.' }
          ] },
        { text: 'A page fires at 02:00 for "checkout errors high". The new engineer on call has never seen this. What helps most?',
          choices: [
            { label: 'A runbook linked from the alert: impact, first checks, rollback, who to escalate to', score: 2, effects: { 'customer trust': 15, 'team health': 10 }, feedback: 'A tired person follows steps. Mitigation takes minutes rather than hours.' },
            { label: 'Call the most senior engineer, every time', score: 0, effects: { 'team health': -15 }, feedback: 'It burns out your best people and teaches nobody else.' },
            { label: 'Hope they work it out from the dashboards', score: 1, effects: { 'customer trust': -5 }, feedback: 'Capable people can, slowly. A runbook captures what the team already learned.' }
          ] },
        { text: 'After the incident, the engineer who ran the wrong rollback command feels terrible. How do you run the postmortem?',
          choices: [
            { label: 'Blameless: find out why the command was possible and why nothing warned them, then fix the system', score: 2, effects: { 'team health': 25, 'customer trust': 5 }, feedback: 'You fix a trap for everyone. People will report problems honestly, which keeps you safe.' },
            { label: 'Name the person in the report and ask them to be more careful', score: 0, effects: { 'team health': -25 }, feedback: 'The next mistake will be hidden rather than reported, and the trap remains.' },
            { label: 'Skip the postmortem to spare feelings', score: 1, effects: { 'team health': 0, 'customer trust': -5 }, feedback: 'Kind, but the same incident will happen again without the learning.' }
          ] }
      ],
      outro: 'Page on **symptoms**, arm responders with **runbooks**, and **learn without blame**.' },

    { type: 'cloze', text: 'An {{SLI}} measures the service, an {{SLO}} sets the target, and an {{SLA}} is the contract. The room left below 100% is the {{error budget}}.',
      distractors: ['RED', 'runbook'],
      explain: 'Measurement, target, contract, and the allowance that the target leaves.' },

    { type: 'short', q: 'What do we call a postmortem that asks "how did the system allow this?" instead of "who is at fault?"', accept: ['blameless', 'blameless postmortem', 'blameless postmortems', 'blameless review'], hint: 'Without blame.',
      explain: 'A **blameless** postmortem focuses on system and process causes, which keeps people honest and makes improvements stick.' }
  ],

  flashcards: [
    { q: 'SLI vs SLO vs SLA?', a: 'SLI is a measurement (share of good requests). SLO is the internal target for it (99.9% over 30 days). SLA is a customer contract with penalties if missed.' },
    { q: 'What is an error budget?', a: 'The amount of unreliability an SLO allows: 100% minus the target. At 99.9% over 30 days that is about 43 minutes. Spend it on change; when it is gone, prioritise reliability.' },
    { q: 'Why alert on symptoms, not causes?', a: 'Symptoms are what users feel, so every page means real harm. Cause alerts are noisy, miss unexpected failures, and train people to ignore the pager.' },
    { q: 'What goes in a runbook?', a: 'What the alert means and its impact, first checks, safe fixes (such as rollback), when to escalate, who owns it and when it was last tested.' },
    { q: 'What makes a postmortem blameless?', a: 'It asks how the system made the mistake easy, not who made it. It records timeline, impact, contributing factors and owned action items.' }
  ],

  glossary: [
    { term: 'SLI', def: 'Service level indicator: a measurement of service quality, such as the share of requests that succeed quickly.', like: 'Your speedometer reading.' },
    { term: 'SLO', def: 'Service level objective: the internal target for an SLI over a period, such as 99.9% over 30 days.', like: 'The speed limit you aim to stay under.' },
    { term: 'SLA', def: 'Service level agreement: a contract with customers that sets consequences, like refunds, if a target is missed.' },
    { term: 'Error budget', def: 'The allowed amount of failure implied by an SLO, spent on releases and risk.', like: 'A monthly spending allowance.' },
    { term: 'Runbook', def: 'A written, step-by-step guide linked to an alert, saying what to check and do.', like: 'A recipe card for emergencies.' },
    { term: 'Postmortem', def: 'A written review after an incident covering what happened, why and what will change; best done blamelessly.', aka: ['incident review'] }
  ],

  takeaways: [
    '**SLI** measures, **SLO** targets, **SLA** promises. Never aim for 100%.',
    'The **error budget** (100% minus the SLO) turns "ship faster or be safer?" into a shared number.',
    '**Page on symptoms** that users feel; keep cause signals on dashboards and tickets.',
    'Use **runbooks**, mitigate first, and run **blameless postmortems** with owned actions.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('observability', {
  title: 'The Fog of Production',
  intro: 'A thick fog has rolled over your production system and a pager is howling. To clear it, you must pick the right signal, read the numbers honestly and respond like a calm professional.',
  questions: [
    { type: 'mcq', q: 'Which statement best separates monitoring from observability?',
      options: ['Monitoring checks predicted problems; observability explains surprises', 'Monitoring uses metrics and observability uses logs', 'Monitoring is for small systems and observability is for large ones', 'They are two names for the same thing'],
      answer: 0,
      why: [null, 'Both use all three kinds of signal. The difference is what you can do with them.', 'Size matters little. The difference is predicted versus unpredicted questions.', 'They overlap but are not identical: observability is about being able to explain behaviour you did not plan for.'],
      explain: 'Monitoring covers questions chosen in advance. Observability is the ability to understand surprises from the data the system emits.' },

    { type: 'bucket', prompt: 'Which signal answers the question best?',
      buckets: ['Metrics', 'Logs', 'Traces'],
      items: [['What fraction of requests failed in the last 5 minutes?', 0], ['What exact error did order 8841 hit?', 1], ['Which service made this one request slow?', 2], ['Is p99 latency trending up this week?', 0], ['What path did one request take across services?', 2], ['What was the payment provider’s reply for one failure?', 1]],
      explain: 'Metrics aggregate numbers over time, logs record individual events, and traces follow one request across services.' },

    { type: 'spot', prompt: 'Tap the line that makes this log statement a security risk.',
      code: { lang: 'js', src: `
        logger.info('payment attempt', {
          requestId: req.id,
          orderId: order.id,
          cardNumber: req.body.cardNumber,
          amount: order.total
        });` },
      lines: [4],
      explain: 'A full card number must never be logged: logs are copied, indexed, backed up and widely read. Log an order ID and, at most, the last four digits.' },

    { type: 'estimate', q: '99 requests take 100 ms and 1 request takes 10 s. Roughly what is the average latency in milliseconds?',
      answer: 199, unit: 'ms', tolerance: 1.2, min: 10, max: 20000,
      explain: '(99 × 100 + 10,000) ÷ 100 = 199 ms. It looks healthy, yet one user waited ten seconds: why percentiles beat averages.' },

    { type: 'multi', q: 'Which of these are sensible labels on a request-count metric?',
      options: ['HTTP method', 'Status code class (2xx, 4xx, 5xx)', 'Route template such as /orders/{id}', 'User ID', 'Full URL including query string'],
      answers: [0, 1, 2],
      explain: 'Labels must be small, bounded sets. User IDs and full URLs have huge numbers of values and explode cardinality. Per-user and per-URL detail belongs in logs and traces.' },

    { type: 'ab', q: 'Which log line is better for investigating payment problems?',
      a: { lang: 'json', label: 'A sentence', src: `
        Payment failed for order 8841 because of a timeout` },
      b: { lang: 'json', label: 'Structured', src: `
        {"event":"payment_failed","order_id":8841,
         "reason":"timeout","request_id":"r-7f3a"}` },
      answer: 'b',
      explain: 'Named fields can be filtered, counted by reason and joined to the rest of the request by its ID. A sentence is hard to query.' },

    { type: 'order', prompt: 'Put the life of a trace in order.',
      items: ['The first service creates a trace ID and a root span', 'The trace ID is passed in a header to the next service', 'Each service creates its own child spans and exports them', 'A collector receives and processes the spans', 'A backend joins them by trace ID into a waterfall'],
      explain: 'Context propagates with the request; the spans are collected separately and stitched together by the shared ID.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['RED', 'Rate, Errors, Duration: for services'], ['USE', 'Utilisation, Saturation, Errors: for resources'], ['Cardinality', 'The number of unique label combinations'], ['OTLP', 'The wire format OpenTelemetry uses'], ['Tail sampling', 'Deciding which traces to keep after they finish']],
      explain: 'A mix of the metric methods and the tracing plumbing from this module.' },

    { type: 'mcq', q: 'A trace waterfall shows 50 tiny identical database spans, one after another, under a single request. What is the likely problem?',
      options: ['An N+1 pattern: one query for each list item', 'The database is down and every call is failing', 'The trace context was lost between two services', 'The request is being sampled out of the store'],
      answer: 0,
      why: [null, 'A down database would show errors or timeouts, not many quick successes.', 'Lost context would split the trace, not repeat the spans within it.', 'Sampling decides whether a trace is kept, not what is inside it.'],
      explain: 'A comb of repeated tiny spans is the N+1 query pattern. Batch the queries or fetch the data in one go.' },

    { type: 'estimate', q: 'Your SLO is 99.9% of requests good over 30 days. About how many minutes of total outage does the error budget allow?',
      answer: 43, unit: 'minutes', tolerance: 1.2, min: 1, max: 100000,
      explain: '0.1% of the 43,200 minutes in 30 days is about 43 minutes.' },

    { type: 'tf', statement: 'The best alerts fire whenever any server metric, such as CPU, crosses a threshold, because they catch problems earliest.', answer: false,
      explain: 'Cause alerts are noisy, miss failures that have other causes and cause alert fatigue. Page on symptoms users feel, and keep causes on dashboards.' },

    { type: 'cloze', text: 'A {{runbook}} guides the responder during an alert. Mitigating with a rollback comes {{before}} finding the root cause. Afterwards a {{blameless}} postmortem asks how the {{system}} allowed the mistake.',
      distractors: ['after', 'person', 'SLA'],
      explain: 'Stop the harm first, then learn. A blameless review fixes the traps in the system rather than punishing the person who stepped into one.' }
  ]
});

KS.sheet('observability', {
  title: 'Observability: cheat sheet',
  sections: [
    { title: 'Monitoring vs observability',
      md: `**Monitoring**: watch predicted problems (dashboards, alerts). **Observability**: understand *any* behaviour from the system's outputs, including surprises.

        | Pillar | Answers | Notes |
        |---|---|---|
        | Metrics | Is it wrong? How bad? | Cheap, aggregated |
        | Logs | What happened here? | Rich, bulky |
        | Traces | Where did the time go? | One request, many services |

        Typical flow: **metric alerts, trace locates, log explains**. Design it in before the outage.` },

    { title: 'Logs',
      md: `- **Structured** (JSON fields), not sentences.
        - Levels: DEBUG, INFO, WARN, ERROR, FATAL.
        - **Correlation / request ID**: made at the edge, passed in a header (\`X-Request-ID\`), on every line.
        - **Centralise** logs: shipper, pipeline, searchable store.
        - **Never log** passwords, tokens, keys, card numbers, unneeded personal data. Log IDs.
        - Budget volume and set retention.` },

    { title: 'Metrics',
      md: `| Type | Behaviour | Example |
        |---|---|---|
        | Counter | Only rises (graph its rate) | Requests total |
        | Gauge | Up and down | Queue length |
        | Histogram | Buckets | Request duration |

        **RED** (services): Rate, Errors, Duration. **USE** (resources): Utilisation, Saturation, Errors. Use **p95/p99, not averages**. **Cardinality** = series count: keep labels bounded (never user IDs).` },

    { title: 'Tracing',
      md: `- **Trace** = one request's journey; **span** = one timed step (name, start, duration, parent, attributes).
        - **Context propagation**: \`traceparent: 00-<trace-id>-<parent-span-id>-<flags>\` (W3C Trace Context).
        - Waterfall: longest bar = slow hop; stacked bars = missed parallelism; comb of tiny bars = N+1.
        - Queues and async hops must carry context too.
        - **Sampling**: head (random, at start) vs tail (keep errors and slow ones).` },

    { title: 'Instrumentation and OpenTelemetry',
      md: `- **Automatic**: agents and libraries wrap frameworks, HTTP clients, DB drivers. **Manual**: your own spans, metrics, attributes.
        - Always end spans (\`finally\`). One span with a count beats a span per loop iteration.
        - Pipeline: **SDK, OTLP, Collector** (batch, filter, redact, sample, route), **backend**.
        - **OpenTelemetry**: vendor-neutral APIs, SDKs, OTLP, Collector, naming conventions. Instrument once, change backends freely.
        - Set and measure an **overhead budget**.` },

    { title: 'SLOs, alerts and incidents',
      md: `| Term | Meaning |
        |---|---|
        | SLI | Measurement (good events / all events) |
        | SLO | Internal target (99.9% over 30 days) |
        | SLA | Customer contract with penalties |
        | Error budget | 100% minus SLO (99.9% ≈ 43 min per 30 days) |

        **Page on symptoms**, not causes; urgent, actionable, real. Burn-rate alerts: fast burn pages, slow burn tickets. **Runbooks** attached to alerts. Incident: acknowledge, assess, **mitigate first**, communicate, resolve, **blameless postmortem** with owned actions.` }
  ]
});

